import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { findAsset } from "../backend/jira/assets";
import { transition } from "../backend/jira/transition";
import { SETTINGS } from "../backend/consts";
import { currentUserHasRole } from "../backend/jira/role";
import { getWorkItem, getWorkItems, createWorkItem, updateWorkItem } from "../backend/jira/workItem";
import { searchWorkItems } from "../backend/jira/search";
import {
  ChargebackIn,
  generateChargebackNumber,
  hasLink,
  getChargebackInList,
  CHARGEBACKIN_FIELDS,
  loadChargebackIn,
  getChargebackOutList,
  generateInvoice,
} from "../backend/chargeback";
import { linkWorkItems } from "../backend/jira/links";
// import { log } from "../backend/logger";
import { computeSharedCosts } from "../backend/sharedCosts";
import { GenerateInvoicesParams } from "../backend/types";
import { Settings, Task } from "../types";
import SettingsCore from "../backend/settings";
import { Spaces } from "../backend/spaces";
import { WorkTypes } from "../backend/workTypes";
import { WorkSpaces } from "../backend/workspaces";
import { ObjectSchemas } from "../backend/objectchemas";
import { ObjectTypes } from "../backend/objecttypes";
import { ObjectAttributes } from "../backend/objectattributes";
import { Fields } from "../backend/fields";
import { Tasks } from "../backend/tasks";
import { Assets } from "../backend/assets";

const resolver = new Resolver();

resolver.define("getServerInfos", async () => {
  const response = await api.asApp().requestJira(route`/rest/api/3/serverInfo`, {
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

resolver.define("getCurrentUserHasChargebackRole", async (): Promise<boolean> => {
  return await currentUserHasRole(SETTINGS.CHARGEBACK_PROJECTROLE_ID);
});

resolver.define("getSettings", async (): Promise<Settings> => {
  return await SettingsCore.getSettings();
});

resolver.define("setSettings", async ({ payload }) => {
  const lPayload = payload as { settings: Settings };
  await SettingsCore.setSettings(lPayload.settings);
});

resolver.define("searchSpaces", async ({ payload }): Promise<Array<{ id: string; name: string }>> => {
  const lPayload = payload as { query: string };
  return await Spaces.searchSpaces(lPayload.query);
});

resolver.define("getSpace", async ({ payload }): Promise<{ id: string; name: string }> => {
  const lPayload = payload as { spaceId: string };
  return await Spaces.getSpace(lPayload.spaceId);
});

resolver.define("getWorkTypes", async ({ payload }): Promise<Array<{ id: string; name: string }>> => {
  const lPayload = payload as { spaceId: string };
  return await WorkTypes.getWorkTypes(lPayload.spaceId);
});

resolver.define("getWorkType", async ({ payload }): Promise<{ id: string; name: string }> => {
  const lPayload = payload as { workTypeId: string };
  return await WorkTypes.getWorkType(lPayload.workTypeId);
});

resolver.define("getWorkSpaces", async (): Promise<Array<{ id: string; name: string }>> => {
  return await WorkSpaces.getWorkSpaces();
});

resolver.define("getObjectSchemas", async ({ payload }): Promise<Array<{ id: string; name: string }>> => {
  const lPayload = payload as { workSpaceId: string };
  return await ObjectSchemas.getObjectSchemas(lPayload.workSpaceId);
});

resolver.define("getObjectTypes", async ({ payload }): Promise<Array<{ id: string; name: string }>> => {
  const lPayload = payload as { workSpaceId: string; objectSchemaId: string };
  return await ObjectTypes.getObjectTypes(lPayload.workSpaceId, lPayload.objectSchemaId);
});

resolver.define("getObjectAttributes", async ({ payload }): Promise<Array<{ id: string; name: string }>> => {
  const lPayload = payload as { workSpaceId: string; objectTypeId: string };
  return await ObjectAttributes.getObjectAttributes(lPayload.workSpaceId, lPayload.objectTypeId);
});

resolver.define("searchFields", async ({ payload }): Promise<Array<{ id: string; name: string }>> => {
  const lPayload = payload as { spaceId: string; query: string };
  return await Fields.searchFields(lPayload.spaceId, lPayload.query);
});

resolver.define("getField", async ({ payload }): Promise<{ id: string; name: string }> => {
  const lPayload = payload as { fieldId: string };
  return await Fields.getField(lPayload.fieldId);
});

// Chargeback process
// Get all work items with specific batch id
resolver.define("getTasksByBatchId", async ({ payload }): Promise<Array<Task>> => {
  const lPayload = payload as { batchId: string; settings: Settings; baseUrl: string };
  return await Tasks.getTasksByBatchId(lPayload.batchId, lPayload.settings, lPayload.baseUrl);
});

resolver.define(
  "loadChargebackAssets",
  async ({ payload }): Promise<{ attrs: Array<{ id: string; name: string }>; assets: Array<any> }> => {
    const lPayload = payload as { settings: Settings };
    return await Assets.loadChargebackAssets(lPayload.settings);
  }
);

// OLD STUFF BELOW HERE - TO CLEAN UP LATER

resolver.define("getNewChargebackInList", async ({ payload }): Promise<ChargebackIn[]> => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  return await getChargebackInList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKIN_WORKTYPE_NAME,
    status: SETTINGS.STATUS_NEW,
  });
});

resolver.define("getAssetErrorChargebackInList", async ({ payload }): Promise<ChargebackIn[]> => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  return await getChargebackInList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKIN_WORKTYPE_NAME,
    status: SETTINGS.STATUS_ASSET_ERROR,
  });
});

resolver.define("getProcessedChargebackInList", async ({ payload }): Promise<ChargebackIn[]> => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  return await getChargebackInList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKIN_WORKTYPE_NAME,
    status: SETTINGS.STATUS_ASSET_OK,
  });
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

// TODO : Chunks process
// Will process chargebackInList to assign application account assets
resolver.define("processChargebackIn", async ({ payload }) => {
  const { chargebackInList } = payload;

  // loop through issues and process each chargebackIn
  for (const chargebackIn of chargebackInList) {
    // Find asset with appAccountId field
    const asset = await findAsset({
      qlQuery: `objectType = "Application Account" AND "Account Id"=${chargebackIn.appAccountId}`,
    });

    if (asset && asset.values && asset.values.length > 0) {
      // console.log("Found application account:", asset.values[0]);
      chargebackIn.appAccountName = asset.values[0].label; // Set the app account name
      // Write back to the issue the link to the asset
      await updateWorkItem({
        workItemKey: chargebackIn.key,
        assetUpdate: {
          [SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountAsset]: [
            {
              set: [
                {
                  workspaceId: `${SETTINGS.WORKSPACE_ID}`,
                  id: `${SETTINGS.WORKSPACE_ID}:${asset.values[0].id}`,
                  objectId: `${asset.values[0].id}`,
                },
              ],
            },
          ],
        },
      });
      await transition({ workItemKey: chargebackIn.key, status: "Asset OK" });
    } else {
      await transition({ workItemKey: chargebackIn.key, status: "Asset Error" });
    }
  }
});

// Returns ChargebackGroupOut
const addChargebackGroupOutItem = async (chargebackOut: any, vendor: any): Promise<any> => {
  const chargebackGroupOutCreate = await createWorkItem({
    issueType: SETTINGS.CHARGEBACKGROUP_OUT_WORKTYPE_NAME,
    summary: `${chargebackOut.fields.summary} - ${vendor.label}`,
    projectKey: SETTINGS.PROJECT_KEY,
  });

  // Asset (vendor) must be added after creation (not supported upon creation)
  await updateWorkItem({
    workItemKey: chargebackGroupOutCreate.key,
    assetUpdate: {
      [SETTINGS.CUSTOMFIELDS_IDS.VendorAsset]: [
        {
          set: [
            {
              workspaceId: `${SETTINGS.WORKSPACE_ID}`,
              id: `${SETTINGS.WORKSPACE_ID}:${vendor.id}`,
              objectId: `${vendor.id}`,
            },
          ],
        },
      ],
    },
  });

  // Link must be added after work item is created
  await linkWorkItems(chargebackOut.key, SETTINGS.CHARGEBACK_GROUP_LINK_NAME, chargebackGroupOutCreate.key);

  return chargebackGroupOutCreate;
};

interface GenerateSingleChargebackInParams {
  chargebackIn: ChargebackIn;
  billingMonth: string;
}

const generateSingleChargebackIn = async ({ chargebackIn, billingMonth }: GenerateSingleChargebackInParams) => {
  // First reload ChargebackIn work item as it may have changed since initial loading
  chargebackIn = await loadChargebackIn(
    await getWorkItem({
      workItemKey: chargebackIn.key,
      fields: CHARGEBACKIN_FIELDS,
    }),
    ""
  );

  // log("Processing ChargebackIn:", chargebackIn);

  // First check if link with ChargebackGroupLineOut exists
  if (hasLink(chargebackIn, SETTINGS.RELATES_LINK_NAME))
    throw new Error(`ChargebackGroupLineOut link exists for ${chargebackIn.key}`);

  // No ChargebackGroupOut link found, search for ChargebackOut using "Billing Month" and Chargeback Account (asset)
  const chargebackAccountAttr = chargebackIn.appAccountAsset.attributes.find(
    (attr: any) => attr.id === SETTINGS.CHARGEBACK_ACCOUNT_ASSET_ID
  );

  const chargebackOutData = await searchWorkItems({
    jql: `"Billing Month" ~ ${billingMonth} AND "${SETTINGS.FN_CHARGEBACK_ASSET}" in aqlFunction("objectId=${chargebackAccountAttr?.objectAttributeValues?.[0]?.referencedObject.id}")`,
    fields: ["summary", "status", "issuelinks"],
  });

  let chargebackOutIssue: any = null;
  let chargebackGroupOutIssues: any[] = [];
  let chargebackGroupOutKeys: string[] = [];
  if (chargebackOutData.length > 0) {
    // Check found issue status
    if (chargebackOutData[0].fields.status.statusCategory.name !== "To Do") {
      throw new Error(`ChargebackOut exists and is not in 'To Do' status`);
    }
    chargebackOutIssue = chargebackOutData[0];

    // Get linked ChargebackGroupOut issues
    // Parse links
    const chargebackGroupOutLinks = chargebackOutIssue!.fields.issuelinks.filter(
      (link: any) => link.type.id === SETTINGS.CHARGEBACK_GROUP_LINK_ID
    );

    chargebackGroupOutKeys = chargebackGroupOutLinks.map((link: any) => link.outwardIssue.key);
  } else {
    // No ChargebackOut found, create it
    let chargebackOutIssue = await createWorkItem({
      issueType: SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME,
      summary: generateChargebackNumber(
        await searchWorkItems({
          jql: `project = ${SETTINGS.PROJECT_KEY} AND issuetype = "${SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME}" ORDER BY created DESC`,
          maxResults: 1,
        })
      ),
      projectKey: SETTINGS.PROJECT_KEY,
      fields: {
        // Billing month
        [SETTINGS.CUSTOMFIELDS_IDS.BillingMonth]: billingMonth,
        // Chargeback account
        [SETTINGS.CUSTOMFIELDS_IDS.ChargebackAccountAsset]: [
          {
            workspaceId: `${SETTINGS.WORKSPACE_ID}`,
            id: `${SETTINGS.WORKSPACE_ID}:${chargebackAccountAttr?.objectAttributeValues?.[0]?.referencedObject.id}`,
            objectId: chargebackAccountAttr?.objectAttributeValues?.[0]?.referencedObject.id,
          },
        ],
      },
    });

    chargebackOutIssue = await getWorkItem({
      workItemKey: chargebackOutIssue.key,
      fields: ["summary"],
    });

    // Then create ChargebackGroupOut items (4, using vendors in assets)
    const vendors = await findAsset({
      qlQuery: `objectType = "vendor"`,
    });
    if (vendors?.values?.length) {
      const results = await Promise.all(
        vendors.values.map((vendor: any) => addChargebackGroupOutItem(chargebackOutIssue, vendor))
      );
      chargebackGroupOutIssues.push(...results);
    }

    chargebackGroupOutKeys = chargebackGroupOutIssues.map((issue: any) => issue.key);
  }

  // Load chargeback group work items
  chargebackGroupOutIssues = await getWorkItems({
    issueIdsOrKeys: chargebackGroupOutKeys,
    fields: ["summary", `${SETTINGS.CUSTOMFIELDS_IDS.VendorAsset}`],
  });

  // Get ChargebackGroupOut corresponding to ChargebackIn using link (kind CHARGEBACK_GROUP_LINK_NAME)
  // and field asset value = vendor
  // TODO : handle Cloud Network Shared Cost & Cloud Security
  // Link is made using vendor in Application Account Asset
  const vendor = chargebackIn.appAccountAsset.attributes.find(
    (attr: any) => attr.id === SETTINGS.CHARGEBACK_VENDOR_ASSET_ID
  )?.objectAttributeValues[0].referencedObject;

  // Find corresponding ChargebackGroupOut issues
  const correspondingGroupOutIssues = chargebackGroupOutIssues.filter((issue: any) => {
    const asset = issue.fields[SETTINGS.CUSTOMFIELDS_IDS.VendorAsset];
    return asset && asset.some((a: any) => a.objectId === vendor.id);
  });

  // console.log("ChargebackGroupOut issues:", correspondingGroupOutIssues);
  if (correspondingGroupOutIssues.length !== 1) {
    throw new Error(
      "Multiple or no ChargebackGroupOut issues found for chargebackIn " + chargebackIn.key + " and vendor " + vendor.id
    );
  }

  // Create ChargebackLineOut (x2, one for debit, one for credit) and link to ChargebackGroupOut ("is chargebackline of") and link to ChargebackIn ("relates to")
  // TODO : handle specific case when vendor is <> seller (to check with Vantiva!)
  const addChargebackLineOut = async (type: "Debit" | "Credit") => {
    const chargebackLineOut = await createWorkItem({
      issueType: SETTINGS.CHARGEBACKLINEOUT_WORKTYPE_NAME,
      summary: chargebackIn.summary,
      projectKey: SETTINGS.PROJECT_KEY,
      fields: {
        [SETTINGS.CUSTOMFIELDS_IDS.Cost]: chargebackIn.cost,
        [SETTINGS.CUSTOMFIELDS_IDS.DebitCredit]: { value: type },
      },
    });

    await linkWorkItems(
      correspondingGroupOutIssues[0].key,
      SETTINGS.CHARGEBACK_GROUP_LINE_LINK_NAME,
      chargebackLineOut.key
    );
    await linkWorkItems(chargebackIn.key, SETTINGS.RELATES_LINK_NAME, chargebackLineOut.key);
  };
  addChargebackLineOut("Debit");
  addChargebackLineOut("Credit");

  // Finally transition chargebackIn to Done status
  await transition({ workItemKey: chargebackIn.key, status: SETTINGS.STATUS_DONE });

  // TODO Cleanup :
  // Remove work items of type ChargebackLineOut with no links
};

// Payload will contain the invoices to process
// and startIndex (bulk process)
resolver.define("generateChargebackOut", async ({ payload }) => {
  // const { chargebackInList, startIndex, billingMonth } = payload;
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  const chargebackInList = await getChargebackInList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKIN_WORKTYPE_NAME,
    status: SETTINGS.STATUS_ASSET_OK,
  });

  const startIndex = params.startIndex || 0;

  const limit = Math.min(chargebackInList.length - startIndex, SETTINGS.PROCESS_COUNT);

  const part = chargebackInList.slice(startIndex, startIndex + limit);

  /*
  Must not be awaited in parallel because several ChargebackIn may be linked to single ChargebackOut
  await Promise.all(
    part.map((chargebackIn: any) => {
      return generateSingleChargebackIn(chargebackIn, payload);
    })
  );
  */
  for (const chargebackIn of part) {
    await generateSingleChargebackIn({ chargebackIn, billingMonth: params.billingMonth });
  }
});

const updateChargebackGroupOutCost = async (chargebackGroupOut: any) => {
  // Load every linked work item of type "CHARGEBACKLINEOUT_WORKTYPE_NAME"
  const linkedWorkItemLinks = chargebackGroupOut.fields.issuelinks?.filter(
    (link: any) => link.type.name === SETTINGS.CHARGEBACK_GROUP_LINE_LINK_NAME
  );

  // Sum costs of linked items matching "debit"
  // let cost = 0;
  if (linkedWorkItemLinks.length > 0) {
    let cost = 0;
    const linkedWorkItems = await getWorkItems({
      issueIdsOrKeys: linkedWorkItemLinks.map((link: any) => link.outwardIssue.id),
      fields: ["summary", SETTINGS.CUSTOMFIELDS_IDS.DebitCredit, SETTINGS.CUSTOMFIELDS_IDS.Cost],
    });

    linkedWorkItems
      .filter((item: any) => {
        return item.fields[SETTINGS.CUSTOMFIELDS_IDS.DebitCredit].value === "Debit";
      })
      .forEach((item: any) => {
        cost += item.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost];
      });

    // Update cost
    updateWorkItem({
      workItemKey: chargebackGroupOut.key,
      fields: {
        [SETTINGS.CUSTOMFIELDS_IDS["Cost"]]: cost,
      },
    });
  }
};

resolver.define("updateChargebackGroupOutCost", async () => {
  // Load all ChargebackGroupOut with new status
  // TODO : add billing month
  const chargebackGroupOutWorkItems = await searchWorkItems({
    jql: `project = ${SETTINGS.PROJECT_KEY} AND issueType = ${SETTINGS.CHARGEBACKGROUP_OUT_WORKTYPE_NAME} AND status = NEW`,
    fields: ["summary", "issuelinks", "cost"],
  });

  await Promise.all(
    chargebackGroupOutWorkItems.map((workItem: any) => {
      return updateChargebackGroupOutCost(workItem);
    })
  );
});

const updateChargebackOutCost = async (chargebackOut: any) => {
  // Load every linked work item of type "CHARGEBACKLINEOUT_WORKTYPE_NAME"
  const linkedWorkItemLinks = chargebackOut.fields.issuelinks?.filter(
    (link: any) => link.type.name === SETTINGS.CHARGEBACK_GROUP_LINK_NAME
  );

  // Sum costs of linked items
  if (linkedWorkItemLinks.length > 0) {
    let cost = 0;
    const linkedWorkItems = await getWorkItems({
      issueIdsOrKeys: linkedWorkItemLinks.map((link: any) => link.outwardIssue.id),
      fields: ["summary", SETTINGS.CUSTOMFIELDS_IDS["Cost"]],
    });

    linkedWorkItems.forEach((item: any) => {
      cost += item.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost];
    });

    // Update cost
    await updateWorkItem({
      workItemKey: chargebackOut.key,
      fields: {
        [SETTINGS.CUSTOMFIELDS_IDS["Cost"]]: cost,
      },
    });

    console.log("Updated cost for", chargebackOut.key, "to", cost);

    // Transition to In Progress state
    await transition({ workItemKey: chargebackOut.key, status: "In Progress" });
  }
};

resolver.define("updateChargebackOutCost", async ({ payload }) => {
  // Load all ChargebackOut with matching billing month
  const chargebackOutWorkItems = await searchWorkItems({
    jql: `project = ${SETTINGS.PROJECT_KEY} AND status = New AND issueType = ${SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME} AND \"Billing Month\" ~ ${payload["billingMonth"]}`,
    fields: ["summary", "issuelinks"],
  });

  await Promise.all(
    chargebackOutWorkItems.map((workItem: any) => {
      return updateChargebackOutCost(workItem);
    })
  );
});

resolver.define("getNewChargebackOutList", async ({ payload }): Promise<ChargebackIn[]> => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;
  // Load all ChargebackOut with matching billing month
  return await getChargebackOutList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME,
    status: "New",
  });
});

resolver.define("getInProgressChargebackOutList", async ({ payload }): Promise<ChargebackIn[]> => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  // Load all ChargebackOut with matching billing month
  return await getChargebackOutList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME,
    status: '"In Progress"',
  });
});

resolver.define("getDoneChargebackOutList", async ({ payload }): Promise<ChargebackIn[]> => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  // Load all ChargebackOut with matching billing month
  return await getChargebackOutList({
    billingMonth: params.billingMonth || new Date().toISOString().slice(0, 7),
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME,
    status: "Closed",
  });
});

resolver.define("computeSharedCosts", async ({ payload }) => {
  computeSharedCosts(payload as GenerateInvoicesParams);
});

resolver.define("generateInvoices", async ({ payload }) => {
  const params: GenerateInvoicesParams = payload as GenerateInvoicesParams;

  const billingMonth = params.billingMonth || new Date().toISOString().slice(0, 7);
  const toProcess = await getChargebackOutList({
    billingMonth: billingMonth,
    baseUrl: params.baseUrl,
    issueType: SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME,
    status: '"In Progress"',
  });

  await Promise.all(
    toProcess.map((workItem: ChargebackIn) => {
      return generateInvoice(workItem);
    })
  );
});

export const handler: any = resolver.getDefinitions();
