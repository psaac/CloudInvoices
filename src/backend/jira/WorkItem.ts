import api, { route } from "@forge/api";

interface CreateWorkItemType {
  issueTypeId: string;
  summary: string;
  spaceId: string;
  fields?: any;
}
// Work item creation
export const createWorkItem = async ({ issueTypeId, summary, spaceId, fields }: CreateWorkItemType) => {
  const body = JSON.stringify({
    fields: {
      issuetype: {
        id: issueTypeId,
      },
      project: {
        id: spaceId,
      },
      summary: summary,
      ...fields,
    },
  });
  // log(`Create work item with body : ${body}`);
  const responseCreate = await api.asApp().requestJira(route`/rest/api/3/issue`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: body,
  });
  if (!responseCreate.ok) {
    throw new Error(
      `Failed to create work item : ${responseCreate.statusText}, errors : ${await responseCreate.text()}`
    );
  }
  return await responseCreate.json();
};

interface UpdateWorkItemType {
  workItemKey: string;
  fields?: {};
  assetUpdate?: {};
}
// Work item update
export const updateWorkItem = async ({ workItemKey, fields, assetUpdate }: UpdateWorkItemType) => {
  const body = JSON.stringify({
    fields: {
      ...fields,
    },
    update: {
      ...assetUpdate,
    },
  });
  // log(`updateWorkItem with body : ${body}`);
  const responseUpdate = await api.asApp().requestJira(route`/rest/api/3/issue/${workItemKey}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  });
  if (!responseUpdate.ok) {
    throw new Error(`Failed to update work item (${workItemKey}), errors : ${await responseUpdate.text()}`);
  }
};

interface GetWorkItemType {
  workItemKey: string;
  fields?: string[];
}
// Work item retrieval
export const getWorkItem = async ({ workItemKey, fields }: GetWorkItemType) => {
  const response = await api
    .asApp()
    .requestJira(route`/rest/api/3/issue/${workItemKey}?fields=${fields?.join(",") ?? ""}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  if (!response.ok) {
    throw new Error(`Failed to get work item (${workItemKey}) : ${response.statusText}`);
  }
  return await response.json();
};

interface GetWorkItemsType {
  issueIdsOrKeys: string[];
  fields: string[];
}
// Bulk work items retrieval
// Warning, 100 work items max !
export const getWorkItems = async ({ issueIdsOrKeys, fields }: GetWorkItemsType): Promise<any[]> => {
  if (issueIdsOrKeys.length > 100) throw new Error("Too many issue IDs");

  const response = await api.asApp().requestJira(route`/rest/api/3/issue/bulkfetch`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ issueIdsOrKeys, fields }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get work items (${issueIdsOrKeys}) : ${response.statusText}`);
  }
  const result = await response.json();
  return result.issues;
};

export const deleteWorkItem = async ({ workItemKey }: { workItemKey: string }): Promise<void> => {
  // Delete JIRA Work item
  await api.asApp().requestJira(route`/rest/api/3/issue/${workItemKey}`, {
    method: "DELETE",
  });
};
