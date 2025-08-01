import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import {
  getAsset,
  WORKSPACE_ID,
  APP_ACCOUNT_OBJECT_ID,
} from "../backend/assets";

const resolver = new Resolver();
const PROJECT_NAME = "TRAIN";
const CHARGEBACK_PROJECTROLE_ID = 10081;

resolver.define("getServerInfos", async () => {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/serverInfo`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  if (!response.ok) {
    throw new Error(`Failed to fetch server info: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    baseUrl: data.baseUrl,
    version: data.version,
    buildNumber: data.buildNumber,
  };
});

resolver.define("getCurrentUserHasChargebackRole", async () => {
  // Get current user id
  const response = await api
    .asUser()
    .requestJira(
      route`rest/api/3/project/${PROJECT_NAME}/roledetails?currentMember=true`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
  if (!response.ok) {
    throw new Error(`Failed to fetch myself info: ${response.statusText}`);
  }
  const data = await response.json();
  return (
    data.find((role) => role.id === CHARGEBACK_PROJECTROLE_ID) !== undefined
  );
});

const getInvoiceInList = async ({ yearMonth, issueType, status, baseUrl }) => {
  const from = `${yearMonth}-01`;
  const toDate = new Date(yearMonth + "-01");
  toDate.setMonth(toDate.getMonth() + 1);
  const to = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;

  const jql = `project = ${PROJECT_NAME} AND created >= "${from}" AND created < "${to}" AND issueType = "${issueType}" AND status = "${status}" ORDER BY created DESC`;

  const response = await api.asApp().requestJira(route`/rest/api/3/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jql,
      maxResults: 50,
      fields: ["summary", "status", "customfield_10081", "customfield_10082"], // customfield_10082 is the appAccountId field
    }),
  });

  const data = await response.json();

  const mapped = await Promise.all(
    (data.issues || []).map(async (invoice) => {
      const appAccountAsset = invoice.fields.customfield_10081;
      let appAccountName = "";
      let cbAccountName = "";
      const asset = await getAsset({
        asset: appAccountAsset,
      });
      if (asset) {
        appAccountName = asset.name;
        const attribute = asset.attributes.find((attr) => attr.id === "129");
        cbAccountName = attribute?.objectAttributeValues?.[0]?.displayValue;
      }

      return {
        key: invoice.key,
        link: `${baseUrl}/browse/${invoice.key}`,
        summary: invoice.fields.summary,
        status: invoice.fields.status.name,
        appAccountId: invoice.fields.customfield_10082,
        appAccountAsset: appAccountAsset,
        appAccountName: appAccountName,
        cbAccountName: cbAccountName,
      };
    })
  );
  return mapped;
};

resolver.define("getNewInvoicesList", async ({ payload }) => {
  const params = {
    ...(payload || {}),
    issueType: "InvoiceIn",
    status: "NEW", // Force status to NEW
  };
  const invoices = await getInvoiceInList(params);
  return invoices;
});

resolver.define("getAssetErrorInvoicesList", async ({ payload }) => {
  const params = {
    ...(payload || {}),
    issueType: "InvoiceIn",
    status: "Asset Error", // Force status to NEW
  };
  const invoices = await getInvoiceInList(params);
  return invoices;
});

resolver.define("getProcessedInvoicesList", async ({ payload }) => {
  const params = {
    ...(payload || {}),
    issueType: "InvoiceIn",
    status: "ASSET OK",
  };
  const invoices = await getInvoiceInList(params);
  return invoices;
});

// resolver.define("getObjects", async () => {
//   const schemaId = 2;

//   const res = await api
//     .asApp()
//     .requestJira(
//       route`/jsm/assets/workspace/${WORKSPACE_ID}/v1/objectschema/2/objecttypes`,
//       { method: "GET" }
//     );

//   const text = await res.text(); // utile pour débug
//   console.log("Assets response raw:", text);
//   return text;

//   /*
//   To get workspace id
//   const response = await api
//     .asApp()
//     .requestJira(route`/rest/servicedeskapi/assets/workspace`);
//   const data = await response.json();
//   console.log("Assets response:", data);
//   */
// });

const transition = async (issueKey, status) => {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${issueKey}/transitions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transition: {
          id: status === "error" ? "11" : "21", // Assuming "11" is the ID for "Error" and "21" for "Asset OK"
        },
      }),
    });
  return response;
};

resolver.define("processInvoices", async ({ payload }) => {
  const { invoices } = payload;

  // loop through issues and process each invoice
  for (const invoice of invoices) {
    // Find asset with appAccountId field
    const qlQuery = JSON.stringify({
      qlQuery: `objectType = "Application Account" AND "Account Id"=${invoice.appAccountId}`,
    });
    const response = await api
      .asApp()
      .requestJira(route`/jsm/assets/workspace/${WORKSPACE_ID}/v1/object/aql`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: qlQuery,
      });

    if (!response.ok) {
      throw new Error(`Failed to process invoice for ${invoice.key}`);
    } else {
      const data = await response.json();
      if (data && data.values && data.values.length > 0) {
        // console.log("Found application account:", data.values[0].label);
        invoice.appAccountName = data.values[0].label; // Set the app account name
        // Write back to the issue the link to the asset
        const updateResponse = api
          .asApp()
          .requestJira(route`/rest/api/3/issue/${invoice.key}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              update: {
                customfield_10081: [
                  {
                    set: [
                      {
                        workspaceId: `${WORKSPACE_ID}`,
                        id: `${WORKSPACE_ID}:${APP_ACCOUNT_OBJECT_ID}`,
                        objectId: `${APP_ACCOUNT_OBJECT_ID}`,
                      },
                    ],
                  },
                ],
              },
            }),
          });
        // todo: check if the updateResponse is ok
        transition(invoice.key, "ok");
        // todo: check if the transition is ok
      } else {
        // console.error("No asset found for appAccountId:", issue.appAccountId);
        transition(invoice.key, "error");
        // todo: check if the transition is ok
      }
    }
  }
  // return invoices; // Return the modified invoices with appAccountName
});

resolver.define("getAsset", async ({ payload }) => {
  return getAsset(payload);
});

export const handler = resolver.getDefinitions();
