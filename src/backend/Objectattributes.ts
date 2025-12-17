import api, { route } from "@forge/api";
import { Options } from "../types";

export class ObjectAttributes {
  public static getObjectAttributes = async (workSpaceId: string, objectTypeId: string): Promise<Options> => {
    const response = await api
      .asApp()
      .requestJira(route`jsm/assets/workspace/${workSpaceId}/v1/objecttype/${objectTypeId}/attributes`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    if (!response.ok) {
      throw new Error(`Failed to fetch object attributes: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((objectAttribute: { id: string; name: string }) => ({
      value: objectAttribute.id,
      label: objectAttribute.name,
    }));
  };
}
