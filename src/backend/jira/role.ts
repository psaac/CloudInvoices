import api, { route } from "@forge/api";
import { SETTINGS } from "../consts";

// Get current user id
async function currentUserHasRole(roleId: Number) {
  const response = await api
    .asUser()
    .requestJira(
      route`rest/api/3/project/${SETTINGS.PROJECT_KEY}/roledetails?currentMember=true`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
  if (!response.ok) {
    throw new Error(`Failed to fetch myself info: ${response.statusText}`);
  }
  const data = await response.json();
  return data.find((role: { id: number }) => role.id === roleId) !== undefined;
}

export { currentUserHasRole };
