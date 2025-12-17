import api, { route } from "@forge/api";
import { Option, Options } from "../types";

export class Spaces {
  public static searchSpaces = async (query: string): Promise<Options> => {
    const response = await api.asApp().requestJira(route`rest/api/3/project/search?query=${query}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch spaces: ${response.statusText}`);
    }

    const data = await response.json();

    return data.values.map((space: { id: string; name: string }) => ({
      value: space.id,
      label: space.name,
    }));
  };

  public static getSpace = async (spaceId: string): Promise<Option> => {
    const response = await api.asApp().requestJira(route`rest/api/3/project/${spaceId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch space: ${response.statusText}`);
    }

    const data = await response.json();

    return { value: data.id, label: data.name };
  };

  public static getSpaceRoles = async (spaceId: string): Promise<Options> => {
    const response = await api.asApp().requestJira(route`rest/api/3/project/${spaceId}/roledetails`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch space roles: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((space: { id: string; name: string }) => ({
      value: space.id,
      label: space.name,
    }));
  };
}
