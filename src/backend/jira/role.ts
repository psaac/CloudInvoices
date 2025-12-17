import api, { route } from "@forge/api";
import { Settings } from "../../types";

// Get current user id
export async function currentUserHasRole(settings: Settings) {
  if ((settings.spaceId ?? "") === "" || (settings.roleId ?? "") === "") {
    return false;
  }
  const response = await api
    .asUser()
    .requestJira(route`rest/api/3/project/${settings.spaceId}/roledetails?currentMember=true`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  if (!response.ok) {
    throw new Error(`Failed to fetch myself info: ${response.statusText}`);
  }
  const data = await response.json();
  return data.find((role: { id: string }) => role.id === settings.roleId) !== undefined;
}
