import api, { route } from "@forge/api";
import { Option, Options } from "../types";

export class WorkTypes {
  public static getWorkTypes = async (spaceId: string, subTaskType: boolean): Promise<Options> => {
    const response = await api
      .asApp()
      .requestJira(route`rest/api/3/issuetype/project?projectId=${spaceId}&level=${subTaskType ? "-1" : "0"}`, {
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
      value: workType.id,
      label: workType.name,
    }));
  };

  public static getWorkType = async (workTypeId: string): Promise<Option> => {
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

    return { value: data.id, label: data.name };
  };
}
