import api, { route } from "@forge/api";
import { Options } from "../types";

export class WorkSpaces {
  public static getWorkSpaces = async (): Promise<Options> => {
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
      value: workSpace.workspaceId,
      label: workSpace.workspaceId,
    }));
  };
}
