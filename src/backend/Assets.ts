import api, { route } from "@forge/api";
import { AssetsAndAttrs, Option, Options } from "../types";

export class Assets {
  // private static Cache: Map<string, any> = new Map();

  public static loadAssets = async (workSpaceId: string, objectTypeId: string): Promise<AssetsAndAttrs> => {
    // First load attributes
    const responseAttr = await api
      .asApp()
      .requestJira(route`jsm/assets/workspace/${workSpaceId}/v1/objecttype/${objectTypeId}/attributes`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    if (!responseAttr.ok) {
      throw new Error(`Failed to fetch attributes: ${responseAttr.statusText}`);
    }

    const dataAttr = await responseAttr.json();
    const attrs = dataAttr.map((dataAttr: { id: string; name: string }) => ({
      id: dataAttr.id,
      name: dataAttr.name,
    }));

    const assetName = dataAttr[0]?.objectType.name || "Unknown";

    // Then load assets
    let startAt = 0;
    const assets: Array<any> = [];
    while (true) {
      const response = await api
        .asApp()
        .requestJira(route`jsm/assets/workspace/${workSpaceId}/v1/object/aql?startAt=${startAt}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qlQuery: `objectType = "${assetName}"`,
          }),
        });
      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.statusText}`);
      }

      const data = await response.json();
      assets.push(...data.values);
      // data.values.forEach((asset: any) => {
      //   if (typeof keyFieldName === "number") {
      //     const attr = asset.attributes.find((attr: any) => attr.id === keyFieldName);
      //     if (attr) assets.set(attr.objectAttributeValues[0]?.value, asset);
      //   } else {
      //     assets.set(asset[keyFieldName], asset);
      //   }
      // });

      if (data.isLast) break;
      else startAt += data.maxResults;
    }

    return {
      attrs,
      assets,
    };
  };

  public static loadAsset = async (workSpaceId: string, id: string): Promise<any> => {
    const response = await api.asApp().requestJira(route`jsm/assets/workspace/${workSpaceId}/v1/object/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.statusText}`);
    }

    return await response.json();
  };

  public static getAsset = async (workSpaceId: string, id: string): Promise<Option> => {
    const json = await Assets.loadAsset(workSpaceId, id);
    return { value: json.id, label: json.label };
  };

  public static searchAssets = async (workSpaceId: string, objectTypeId: string, query: string): Promise<Options> => {
    const response = await api.asApp().requestJira(route`jsm/assets/workspace/${workSpaceId}/v1/object/aql`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qlQuery: `objectTypeId = "${objectTypeId}" AND label like "${query}"`,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to search assets: ${response.statusText}`);
    }

    const json = await response.json();
    return json.values.map((asset: any) => ({ value: asset.id, label: asset.label }));
  };
}
