import api, { route } from "@forge/api";

export class Spaces {
  public static searchSpaces = async (query: string): Promise<Array<{ id: string; name: string }>> => {
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
      id: space.id,
      name: space.name,
    }));
  };

  public static getSpace = async (spaceId: string): Promise<{ id: string; name: string }> => {
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

    return { id: data.id, name: data.name };
  };
}
