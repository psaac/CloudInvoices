import api, { route } from "@forge/api";

export class WorkTypes {
  public static getWorkTypes = async (spaceId: string): Promise<Array<{ id: string; name: string }>> => {
    const response = await api.asApp().requestJira(route`rest/api/3/issuetype/project?projectId=${spaceId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch work types: ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((workType: { id: string; name: string }) => ({
      id: workType.id,
      name: workType.name,
    }));
  };

  public static getWorkType = async (workTypeId: string): Promise<{ id: string; name: string }> => {
    const response = await api.asApp().requestJira(route`rest/api/3/issuetype/${workTypeId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch work type: ${response.statusText}`);
    }

    const data = await response.json();

    return { id: data.id, name: data.name };
  };
}
