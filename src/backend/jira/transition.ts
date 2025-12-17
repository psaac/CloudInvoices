import api, { APIResponse, route } from "@forge/api";

interface TransitionParams {
  workItemKey: string;
  status: string;
}

const transition = async ({ workItemKey, status }: TransitionParams): Promise<APIResponse> => {
  // Find transition id using status name
  const transitionsResponse = await api.asApp().requestJira(route`/rest/api/3/issue/${workItemKey}/transitions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!transitionsResponse.ok) throw new Error("Failed to fetch transitions");
  const transitionsData = await transitionsResponse.json();

  const needle = status.toLowerCase();
  const transitionId = transitionsData.transitions.find((s: any) => s.to.name.toLowerCase() === needle)?.id;
  console.log("Found transitionId:", transitionId, "for status:", status);
  if (transitionId === undefined) {
    throw new Error(`Status "${status}" not found`);
  }

  const body = JSON.stringify({
    transition: {
      id: transitionId,
    },
  });
  // log("Transitioning issue:", workItemKey, "to status:", status);

  const response = await api.asApp().requestJira(route`/rest/api/3/issue/${workItemKey}/transitions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
  if (!response.ok) {
    throw new Error(`Failed to transition issue ${workItemKey} to ${status}`);
  }
  return response;
};

export { transition };
