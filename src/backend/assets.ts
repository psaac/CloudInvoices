import api, { route } from "@forge/api";
import { Settings } from "../types";

export class Assets {
  public static loadChargebackAssets = async (
    settings: Settings
  ): Promise<{ attrs: Array<{ id: string; name: string }>; assets: Array<any> }> => {
    // First load attributes
    const responseAttr = await api
      .asApp()
      .requestJira(
        route`jsm/assets/workspace/${settings.workSpaceId || ""}/v1/objecttype/${
          settings.chargebackAccountObjectTypeId || ""
        }/attributes`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );
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
    // TODO : handle pagination if needed
    const response = await api
      .asApp()
      .requestJira(route`jsm/assets/workspace/${settings.workSpaceId || ""}/v1/object/aql?includeAttributes=false`, {
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

    return {
      attrs,
      assets: data.values,
    };
  };
}
