import api, { route } from "@forge/api";

export class WorkSpaces {
  public static getWorkSpaces = async (): Promise<Array<{ id: string; name: string }>> => {
    const response = await api.asApp().requestJira(route`rest/servicedeskapi/assets/workspace`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch workspaces: ${response.statusText}`);
    }

    const data = await response.json();

    return data.values.map((workSpace: { workspaceId: string }) => ({
      id: workSpace.workspaceId,
      name: workSpace.workspaceId,
    }));
  };
}
