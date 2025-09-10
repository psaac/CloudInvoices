import api, { route } from "@forge/api";

const linkWorkItems = async (issueKey: string, linkType: string, linkedIssueKey: string) => {
  const response = await api.asApp().requestJira(route`/rest/api/3/issueLink`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: { name: linkType },
      inwardIssue: { key: issueKey }, // Source issue
      outwardIssue: { key: linkedIssueKey }, // Target issue
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add link: ${response.statusText}`);
  }

  // return await response.json();
  // Does not return anything !
};

export { linkWorkItems };
