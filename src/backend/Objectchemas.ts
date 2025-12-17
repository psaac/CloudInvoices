import api, { route } from "@forge/api";
import { Options } from "../types";

export class ObjectSchemas {
  public static getObjectSchemas = async (workSpaceId: string): Promise<Options> => {
    const response = await api
      .asApp()
      .requestJira(route`jsm/assets/workspace/${workSpaceId}/v1//objectschema/list?includeCounts=false`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    if (!response.ok) {
      throw new Error(`Failed to fetch object schemas: ${response.statusText}`);
    }

    const data = await response.json();

    return data.values.map((objectSchema: { id: string; name: string }) => ({
      value: objectSchema.id,
      label: objectSchema.name,
    }));
  };
}
