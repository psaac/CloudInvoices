import api, { route } from "@forge/api";
import { SETTINGS } from "../consts";

const getAsset = async (params: { assetId: string }) => {
  if (params.assetId) {
    const response = await api
      .asApp()
      .requestJira(route`/jsm/assets/workspace/${SETTINGS.WORKSPACE_ID}/v1/object/${params.assetId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

    if (!response.ok) {
      return null;
    } else {
      const data = await response.json();
      return data;
    }
  } else return null;
};

const findAsset = async (params: { qlQuery: string }) => {
  const response = await api.asApp().requestJira(route`/jsm/assets/workspace/${SETTINGS.WORKSPACE_ID}/v1/object/aql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      qlQuery: params.qlQuery,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to find asset: ${response.statusText}`);
  }
  return await response.json();
};

export { findAsset, getAsset };
