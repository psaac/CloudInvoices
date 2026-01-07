import api, { route } from "@forge/api";
// import { log } from "../logger";
// import { log } from "../logger";

interface SearchWorkItemsType {
  jql: string;
  fields?: string[];
  maxResults?: number;
  nextPageToken?: string;
}

async function internalSearchWorkItems(params: SearchWorkItemsType) {
  // console.log("Searching work items with JQL:", JSON.stringify(params));
  const response = await api.asApp().requestJira(route`/rest/api/3/search/jql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch work items with error: " + response.statusText + " : " + (await response.text()));
  }
  return await response.json();
}

async function searchWorkItems({ jql, fields, maxResults }: SearchWorkItemsType) {
  // log("Searching work items with JQL:", JSON.stringify({ jql, fields, maxResults }));
  fields = fields || ["summary"];
  maxResults = maxResults || 50;
  // TODO: add project filtering to JQL if not present
  let responseData = await internalSearchWorkItems({
    jql,
    fields,
    maxResults,
  });
  let result = responseData.issues;

  while (!responseData.isLast) {
    responseData = await internalSearchWorkItems({
      jql,
      fields,
      maxResults,
      nextPageToken: responseData.nextPageToken,
    });
    result = result.concat(responseData.issues);
  }
  return result;
}

export { searchWorkItems };
