import api, { route } from "@forge/api";
import { Options } from "../types";

export class ObjectTypes {
  public static getObjectTypes = async (workSpaceId: string, objectSchemaId: string): Promise<Options> => {
    const response = await api
      .asApp()
      .requestJira(route`jsm/assets/workspace/${workSpaceId}/v1//objectschema/${objectSchemaId}/objecttypes/flat`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    if (!response.ok) {
      throw new Error(`Failed to fetch object types: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((objectType: { id: string; name: string }) => ({
      value: objectType.id,
      label: objectType.name,
    }));
  };
}
