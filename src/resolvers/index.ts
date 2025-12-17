import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { Settings, AssetsAndAttrs, Options, Option, ServerInfo } from "../types";
import SettingsCore from "../backend/Settings";
import { Spaces } from "../backend/Spaces";
import { WorkTypes } from "../backend/WorkTypes";
import { WorkSpaces } from "../backend/Workspaces";
import { ObjectSchemas } from "../backend/Objectchemas";
import { ObjectTypes } from "../backend/Objecttypes";
import { ObjectAttributes } from "../backend/Objectattributes";
import { Fields } from "../backend/Fields";
import { Assets } from "../backend/Assets";
import { CloudData, CloudVendor } from "../backend/CloudData";
import { UserInput } from "../backend/UserInput";
import { getAttachment, deleteAttachment } from "../backend/jira/attachments";
import { Chargeback } from "../backend/Chargeback";
import { loadWithMapsFromRaw } from "../backend/Utils";
import { currentUserHasRole } from "../backend/jira/role";
import { deleteWorkItem } from "../backend/jira/WorkItem";
import { InvoiceLine } from "../backend/InvoiceLine";

const resolver = new Resolver();

resolver.define("getServerInfos", async (): Promise<ServerInfo> => {
  const response = await api.asApp().requestJira(route`/rest/api/3/serverInfo`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch server info: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    baseUrl: data.baseUrl,
    version: data.version,
    buildNumber: data.buildNumber,
  };
});

resolver.define("getSpaceRoles", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { spaceId: string };
  return await Spaces.getSpaceRoles(lPayload.spaceId);
});

resolver.define("getCurrentUserHasChargebackRole", async ({ payload }): Promise<boolean> => {
  const lPayload = payload as { settings: Settings };
  return await currentUserHasRole(lPayload.settings);
});

resolver.define("getSettings", async (): Promise<Settings> => {
  return await SettingsCore.getSettings();
});

resolver.define("setSettings", async ({ payload }) => {
  const lPayload = payload as { settings: Settings };
  await SettingsCore.setSettings(lPayload.settings);
});

resolver.define("getUserInput", async () => {
  return await UserInput.loadFromStore();
});

resolver.define("setUserInput", async ({ payload }) => {
  const lPayload = payload as { userInput: UserInput };
  await UserInput.saveToStore(lPayload.userInput);
});

resolver.define("searchSpaces", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { query: string };
  return await Spaces.searchSpaces(lPayload.query);
});

resolver.define("getSpace", async ({ payload }): Promise<Option> => {
  const lPayload = payload as { spaceId: string };
  return await Spaces.getSpace(lPayload.spaceId);
});

resolver.define("getWorkTypes", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { spaceId: string; subTaskType: boolean };
  return await WorkTypes.getWorkTypes(lPayload.spaceId, lPayload.subTaskType);
});

resolver.define("getWorkType", async ({ payload }): Promise<Option> => {
  const lPayload = payload as { workTypeId: string };
  return await WorkTypes.getWorkType(lPayload.workTypeId);
});

resolver.define("getWorkSpaces", async (): Promise<Options> => {
  return await WorkSpaces.getWorkSpaces();
});

resolver.define("getObjectSchemas", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { workSpaceId: string };
  return await ObjectSchemas.getObjectSchemas(lPayload.workSpaceId);
});

resolver.define("getObjectTypes", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { workSpaceId: string; objectSchemaId: string };
  return await ObjectTypes.getObjectTypes(lPayload.workSpaceId, lPayload.objectSchemaId);
});

resolver.define("getObjectAttributes", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { workSpaceId: string; objectTypeId: string };
  return await ObjectAttributes.getObjectAttributes(lPayload.workSpaceId, lPayload.objectTypeId);
});

resolver.define("searchFields", async ({ payload }): Promise<Options> => {
  const lPayload = payload as { spaceId: string; query: string };
  return await Fields.searchFields(lPayload.spaceId, lPayload.query);
});

resolver.define("getField", async ({ payload }): Promise<Option> => {
  const lPayload = payload as { fieldId: string };
  return await Fields.getField(lPayload.fieldId);
});

// Chargeback process
// Get all work items with specific batch id
resolver.define("getCloudDataByBillingMonth", async ({ payload }): Promise<Array<CloudData>> => {
  const lPayload = payload as { billingMonth: string; settings: Settings; baseUrl: string };
  return await CloudData.getCloudDataByBillingMonth(lPayload.billingMonth, lPayload.settings, lPayload.baseUrl);
});

resolver.define("getCloudVendors", async ({ payload }): Promise<Array<CloudVendor>> => {
  const lPayload = payload as { settings: Settings };
  return await CloudData.getCloudVendors(lPayload.settings);
});

resolver.define("getInvoiceLinesByBillingMonth", async ({ payload }): Promise<Array<InvoiceLine>> => {
  const lPayload = payload as { billingMonth: string; settings: Settings; baseUrl: string };
  return await Chargeback.getInvoiceLinesByBillingMonth(lPayload.billingMonth, lPayload.settings, lPayload.baseUrl);
});

resolver.define("loadChargebackAssets", async ({ payload }): Promise<AssetsAndAttrs> => {
  const lPayload = payload as { settings: Settings };
  return await Assets.loadChargebackAssets(lPayload.settings);
});

resolver.define("loadApplicationAssets", async ({ payload }): Promise<AssetsAndAttrs> => {
  const lPayload = payload as { settings: Settings };
  return await Assets.loadApplicationAssets(lPayload.settings);
});

resolver.define("getAttachment", async ({ payload }): Promise<string> => {
  const lPayload = payload as { attachmentId: string };
  return await getAttachment(lPayload.attachmentId);
});

resolver.define("createChargebackItem", async ({ payload }) => {
  const lPayload = payload as { settings: Settings; summary: string; billingMonth: string };
  // Create JIRA Work item to store Invoices (as sub-tasks) & ID Files
  // Return work item key and last chargeback number
  return await Chargeback.createChargebackItem({
    settings: lPayload.settings,
    summary: lPayload.summary,
    billingMonth: lPayload.billingMonth,
  });
});

resolver.define("deleteInvoiceSubItem", async ({ payload }) => {
  const lPayload = payload as { workItemKey: string };
  return await deleteWorkItem({ workItemKey: lPayload.workItemKey });
});

resolver.define("deleteAttachment", async ({ payload }) => {
  const lPayload = payload as { attachmentId: string };
  return await deleteAttachment({ attachmentId: lPayload.attachmentId });
});

resolver.define("createInvoiceSubItem", async ({ payload }) => {
  const lPayload = payload as { settings: Settings; parentWorkItemKey: string; summary: string; invoice: string };
  return await Chargeback.createInvoiceSubItem({
    settings: lPayload.settings,
    parentWorkItemKey: lPayload.parentWorkItemKey,
    summary: lPayload.summary,
    invoice: loadWithMapsFromRaw(lPayload.invoice),
  });
});

export const handler: any = resolver.getDefinitions();
