import { Settings } from "../types";
import { searchWorkItems } from "./jira/search";
import { Fields } from "./Fields";
import api, { route } from "@forge/api";

export interface CloudVendor {
  value: string;
}

export class CloudData {
  Key: string;
  BatchId: string;
  BillingMonth: string;
  CloudVendor: CloudVendor;
  Summary: string;
  Attachments: Array<any>;
  Link: string;

  constructor(
    key: string,
    batchId: string,
    billingMonth: string,
    cloudVendor: CloudVendor,
    summary: string,
    attachments: Array<any>,
    link: string
  ) {
    this.Key = key;
    this.BatchId = batchId;
    this.BillingMonth = billingMonth;
    this.CloudVendor = cloudVendor;
    this.Summary = summary;
    this.Attachments = attachments;
    this.Link = link;
  }

  public static getCloudDataByBillingMonth = async (
    billingMonth: string,
    settings: Settings,
    baseUrl: string
  ): Promise<Array<CloudData>> => {
    const data = await searchWorkItems({
      jql: `project = ${settings.spaceId} AND cf[${Fields.fieldId(
        settings.inputFieldBillingMonth
      )}] ~ ${billingMonth} AND issueType = "${settings.taskWorkTypeId}"`,
      fields: [
        "summary",
        "attachment",
        `${settings.inputFieldBatchId}`,
        `${settings.inputFieldBillingMonth}`,
        `${settings.inputFieldCloudVendor}`,
      ],
    });

    if (data && data.length > 0) {
      return data.map((workItem: any) => ({
        Key: workItem.key,
        BatchId: workItem.fields[settings.inputFieldBatchId] || "",
        BillingMonth: workItem.fields[settings.inputFieldBillingMonth] || "",
        CloudVendor: { value: workItem.fields[settings.inputFieldCloudVendor].value },
        Summary: workItem.fields.summary || "",
        // Filter json attachments
        Attachments: (workItem.fields.attachment || []).filter(
          (att: any) => att.mimeType === "application/json" || att.mimeType === "text/plain"
        ),
        Link: `${baseUrl}/browse/${workItem.key}`,
      }));
    }

    return [];
  };

  public static getCloudVendors = async (settings: Settings): Promise<Array<CloudVendor>> => {
    const fieldId = settings.inputFieldCloudVendor || "";

    // Find spaces context for field
    const responseSpaceContexts = await api
      .asApp()
      .requestJira(route`/rest/api/3/field/${fieldId}/context/projectmapping`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    if (!responseSpaceContexts.ok) {
      throw new Error(
        "Failed to fetch issue type contexts with error: " +
          responseSpaceContexts.statusText +
          " : " +
          (await responseSpaceContexts.text())
      );
    }
    const spaceContexts = await responseSpaceContexts.json();
    // If there is a mapping for the space, get that context id
    let context = spaceContexts.values.find((ctx: any) => ctx.projectId && ctx.projectId === settings.spaceId);
    if (context) {
      // Find issue types context for field
      const responseIssueTypeContexts = await api
        .asApp()
        .requestJira(route`/rest/api/3/field/${fieldId}/context/issuetypemapping?contextId=${context.contextId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      if (!responseIssueTypeContexts.ok) {
        throw new Error(
          "Failed to fetch issue type contexts with error: " +
            responseIssueTypeContexts.statusText +
            " : " +
            (await responseIssueTypeContexts.text())
        );
      }
      const issueTypeContexts = await responseIssueTypeContexts.json();
      // Check if there is a mapping for the issue type or an "any issue type" context
      context = issueTypeContexts.values.find(
        (ctx: any) => ctx.isAnyIssueType || (ctx.issueTypeId && ctx.issueTypeId === settings.taskWorkTypeId)
      );
    }

    // Specific context not found, get default context
    if (!context) {
      const response = await api
        .asApp()
        .requestJira(route`/rest/api/3/field/${fieldId}/contexts?isGlobalContext=true`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      if (!response.ok) {
        throw new Error(
          "Failed to fetch field contexts with error: " + response.statusText + " : " + (await response.text())
        );
      }
      const contexts = await response.json();
      if (contexts.values.length === 0) {
        throw new Error("No contexts found for field: " + settings.inputFieldCloudVendor);
      } else context = contexts.values[0];
    }

    // Then get opstions for that context
    const responseOptions = await api
      .asApp()
      .requestJira(route`/rest/api/3/field/${fieldId}/context/${context.contextId || context.id}/option`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    if (!responseOptions.ok) {
      throw new Error(
        "Failed to fetch field options with error: " +
          responseOptions.statusText +
          " : " +
          (await responseOptions.text())
      );
    }
    const options = await responseOptions.json();
    return options.values.map((option: any) => ({ value: option.value }));
  };
}
