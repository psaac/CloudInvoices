import api, { route } from "@forge/api";

const WORKSPACE_ID = "be974a53-dacb-4d9a-8819-b45c437474cb"; // This is the ID of the Assets workspace
const APP_ACCOUNT_OBJECT_ID = 19; // This is the ID of the "Application Account" object type in Assets;

const findAsset = async (payload) => {
  const { objectType, fieldName, assetId } = payload;

  const qlQuery = JSON.stringify({
    qlQuery: `objectType = "${objectType}" AND "${fieldName}"=${assetId}`,
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
    // throw new Error(`Failed to process invoice for ${issue.key}`);
    return null;
  } else {
    const data = await response.json();
    if (data && data.values && data.values.length > 0) {
      // console.log("Found application account:", data.values[0].label);
      // issue.appAccountName = data.values[0].label; // Set the app account name
      return data.values[0];
    } else {
      return null;
    }
  }
};

const getAsset = async (payload) => {
  const { asset } = payload;
  if (asset && asset.length > 0) {
    const response = await api
      .asApp()
      .requestJira(
        route`/jsm/assets/workspace/${WORKSPACE_ID}/v1/object/${asset[0].objectId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok) {
      return null;
    } else {
      const data = await response.json();
      return data;
    }
  } else {
    return null;
  }
};

export { findAsset, getAsset, WORKSPACE_ID, APP_ACCOUNT_OBJECT_ID };
