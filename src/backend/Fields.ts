import api, { route } from "@forge/api";
import { Option, Options } from "../types";

export class Fields {
  public static searchFields = async (spaceId: string, query: string): Promise<Options> => {
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
      value: field.id,
      label: field.name,
    }));
  };

  public static getField = async (fieldId: string): Promise<Option> => {
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
        value: data.values[0].id,
        label: data.values[0].name,
      };
    else return { value: fieldId, label: "Unknown Field" };
  };

  public static fieldId(fieldName: string): string {
    return fieldName.replace("customfield_", "");
  }
}
