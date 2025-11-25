import { Task, Settings } from "../types";
import { searchWorkItems } from "./jira/search";
import { Fields } from "./fields";

export class Tasks {
  public static getTasksByBatchId = async (
    batchId: string,
    settings: Settings,
    baseUrl: string
  ): Promise<Array<Task>> => {
    const taskList = await searchWorkItems({
      jql: `project = ${settings.spaceId} AND cf[${Fields.fieldId(
        settings.inputFieldBatchId || ""
      )}] ~ ${batchId} AND issueType = "${settings.taskWorkTypeId}"`,
      fields: [
        "summary",
        `${settings.inputFieldBatchId}`,
        `${settings.inputFieldBillingMonth}`,
        `${settings.inputFieldExternalId}`,
        `${settings.inputFieldCost}`,
        `${settings.inputFieldAccountId}`,
      ],
    });

    if (taskList && taskList.length > 0) {
      return taskList.map((workItem: any) => ({
        Key: workItem.key,
        BatchId: workItem.fields[settings.inputFieldBatchId || ""] || "",
        BillingMonth: workItem.fields[settings.inputFieldBillingMonth || ""] || "",
        ExternalId: workItem.fields[settings.inputFieldExternalId || ""] || "",
        Summary: workItem.fields.summary || "",
        Cost: workItem.fields[settings.inputFieldCost || ""] || 0,
        AccountId: workItem.fields[settings.inputFieldAccountId || ""] || "",
        link: `${baseUrl}/browse/${workItem.key}`,
      }));
    }

    return [];
  };
}
