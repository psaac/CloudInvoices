import api, { route } from "@forge/api";

interface SearchWorkItemsType {
  jql: string;
  fields?: string[];
  maxResults?: number;
  nextPageToken?: string;
  limit?: number;
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

async function searchWorkItems({ jql, fields, maxResults, limit = 0 }: SearchWorkItemsType) {
  // log("Searching work items with JQL:", JSON.stringify({ jql, fields, maxResults }));
  fields = fields || ["summary"];
  maxResults = maxResults || 50;
  if (limit > 0 && maxResults > limit) {
    maxResults = limit;
  }
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
    if (limit > 0 && result.length >= limit) {
      return result.slice(0, limit);
    }
  }
  return result;
}

export { searchWorkItems };
