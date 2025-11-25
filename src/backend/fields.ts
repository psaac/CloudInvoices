import api, { route } from "@forge/api";

export class Fields {
  public static searchFields = async (spaceId: string, query: string): Promise<Array<{ id: string; name: string }>> => {
    const response = await api
      .asApp()
      .requestJira(route`rest/api/3/field/search?query=${query}&projectIds=${spaceId}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
    if (!response.ok) {
      throw new Error(`Failed to fetch object attributes: ${response.statusText}`);
    }

    const data = await response.json();

    return data.values.map((field: { id: string; name: string }) => ({
      id: field.id,
      name: field.name,
    }));
  };

  public static getField = async (fieldId: string): Promise<{ id: string; name: string }> => {
    const response = await api.asApp().requestJira(route`rest/api/3/field/search?id=${fieldId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch object attributes: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.values.length > 0)
      return {
        id: data.values[0].id,
        name: data.values[0].name,
      };
    else return { id: fieldId, name: "Unknown Field" };
  };

  public static fieldId(fieldName: string): string {
    return fieldName.replace("customfield_", "");
  }
}
