import api, { route } from "@forge/api";

export class ObjectSchemas {
  public static getObjectSchemas = async (workSpaceId: string): Promise<Array<{ id: string; name: string }>> => {
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
      id: objectSchema.id,
      name: objectSchema.name,
    }));
  };
}
