import { invoke } from "@forge/bridge";
import { Settings, Task } from "../types";
import { saveWithMapsFromRaw } from "../backend/Utils";
import { getChargebackIdStr, InvoiceLine } from "../backend/InvoiceLine";
import { ExcelHelper } from "./excelHelper";
import { Workbook } from "exceljs";
import { CloudData } from "../backend/CloudData";

export interface AppAccountCost {
  AppId: string;
  AppName: string;
  TotalAmount: number | 0;
  Tasks: Task[];
}

export interface VendorCost {
  Vendor: string;
  TotalAmount: number | 0;
  CostsByAppAccount: Map<string, AppAccountCost>; // Key is Application Account ID
}

export interface Invoice {
  ChargebackId?: number; // To be generated
  ChargebackIdStr?: string; // To be generated
  Ignore: boolean | false;
  CustomerId: string; // Chargeback Account ID
  Customer: string; // Project on invoice
  BillingMonth: string;
  Date: string; // Invoice date
  CostCenter: string; // Charge CC
  Owner: string; // Chargeback Owner
  Controller: string; // Chargeback Finance Controller
  emailsToNotify: Array<string>; // Emails to notify
  Tenant: string; // Chargeback Tenant
  SoldToCode: string; // Chargeback Reporting Unit
  SoldToName: string; // Reporting Unit Name
  SoldToAddress: string; // Reporting Unit Address
  SoldToCountry: string; // Reporting Unit Country
  RemitToCode: string; // Chargeback Reporting Unit
  RemitToName: string; // Reporting Unit Name
  RemitToAddress: string; // Reporting Unit Address
  RemitToCountry: string; // Reporting Unit Country
  SAPAccount: string; // SAP Account to use
  TotalAmount: number | 0;
  CostsByVendor: Map<string, VendorCost>; // Key is Vendor Name
  TotalByAppAccount: Map<string, AppAccountCost>; // Key is Application Account ID
  LegalEntityCode: string; // Legal Entity Code
  LegalEntitySystem: string; // Legal Entity System
}

export interface Invoices {
  BillingMonth: string;
  TotalAmount: number | 0;
  NetworkSharedCosts: number | 0;
  SecuritySharedCosts: number | 0;
  TotalByVendor: Map<string, number>; // Key is Vendor Name
  Invoices: Map<string, Invoice>; // Key is CustomerId
  // TotalIgnoredCosts: number | 0;
  GrandTotal: number | 0;
}

export const generateInvoicesAndIDFiles = async ({
  settings,
  invoices,
  selectedCloudData,
  baseUrl,
  updateProgress,
}: {
  settings: Settings;
  invoices: Invoices;
  selectedCloudData: Array<CloudData>;
  baseUrl: string;
  updateProgress: (progress: number, message?: string) => void;
}): Promise<Array<InvoiceLine>> => {
  updateProgress(0, "Preparing...");
  // Retreive Default Legal Entity Asset
  const defaultLegalEntityAsset: any = await invoke("getAssetById", {
    workSpaceId: settings.workSpaceId,
    assetId: settings.defaultLegalEntityId,
  });
  const defaultLegalEntityCode = defaultLegalEntityAsset.attributes.find(
    (attr: any) => attr.id === settings.legalEntityObjectAttributeCode,
  ).objectAttributeValues[0].value;
  const defaultLegalEntitySystem = defaultLegalEntityAsset.attributes.find(
    (attr: any) => attr.id === settings.legalEntityObjectAttributeSystem,
  ).objectAttributeValues[0].value;

  const result: Array<InvoiceLine> = [];
  // Create JIRA Work item to store Invoices (as sub-tasks) & ID Files
  const mainSummary = `Chargeback Invoices & IDocs Files - ${invoices.BillingMonth}`;

  // First cleanup any existing chargeback item for the same billing month to avoid duplicates
  const existingChargebackItems = (await invoke("getExistingChargebackItem", {
    settings,
    billingMonth: invoices.BillingMonth,
  })) as Array<{ key: string; subtasks: Array<string> }> | null;

  if (existingChargebackItems && existingChargebackItems.length > 0) {
    for (const workItem of existingChargebackItems) {
      // Delete sub-tasks first
      for (const subTaskKey of workItem.subtasks) {
        updateProgress(0, `Cleaning up existing invoice item ${subTaskKey}...`);
        await invoke("deleteWorkItem", { workItemKey: subTaskKey });
      }
      // Then delete main item
      updateProgress(0, `Cleaning up existing chargeback item ${workItem.key}...`);
      await invoke("deleteWorkItem", { workItemKey: workItem.key });
    }
  }

  updateProgress(0, `Creating new chargeback item...`);
  const chargebackItem: {
    key: string;
    lastChargebackNumber: number;
  } = await invoke("createChargebackItem", {
    settings,
    summary: mainSummary,
    billingMonth: invoices.BillingMonth,
  });
  result.push({
    ChargebackIdStr: "-",
    Summary: mainSummary,
    Key: chargebackItem.key,
    Link: `${baseUrl}/browse/${chargebackItem.key}`,
    Status: "Open",
  });

  // Generate Invoice PDF & sub-tasks
  let index = 0;
  for (const [_, invoice] of invoices.Invoices) {
    updateProgress(index / invoices.Invoices.size, `Generating invoice for Project ${invoice.Customer}...`);
    // Set invoice Date
    invoice.Date = new Date().toLocaleDateString("en-CA");
    // Generate Chargeback Id
    chargebackItem.lastChargebackNumber++;
    invoice.ChargebackId = chargebackItem.lastChargebackNumber;
    invoice.ChargebackIdStr = getChargebackIdStr(settings.invoicePrefix, invoice.ChargebackId);

    // if (index > 0) continue; // Debug: process only first invoice

    // Create sub-task
    const summary = `Invoice ${invoice.ChargebackIdStr} for Project ${invoice.Customer} - ${invoice.BillingMonth}`;
    const subTaskKey = (await invoke("createInvoiceSubItem", {
      settings,
      parentWorkItemKey: chargebackItem.key,
      summary,
      invoice: saveWithMapsFromRaw(invoice),
      defaultLegalEntityCode,
      defaultLegalEntitySystem,
    })) as string;

    result.push({
      ChargebackIdStr: invoice.ChargebackIdStr,
      Summary: summary,
      Key: subTaskKey,
      Link: `${baseUrl}/browse/${subTaskKey}`,
      Status: "Open",
    });

    index++;
  }

  // At the end, generate single Excel file containing all :
  //   - Raw Data
  //   - DBT
  //   - E-INV file
  // Attach it to the main work item
  const workbook = new Workbook();
  await ExcelHelper.generateRawData(selectedCloudData, workbook);
  await ExcelHelper.generateDBT(invoices, workbook);
  await ExcelHelper.generateEINV(invoices, workbook);

  // Attach xlsx file
  workbook.xlsx.writeBuffer().then(async (buffer) => {
    const uint8Array02 = new Uint8Array(buffer);
    await invoke("attachToIssue", {
      workItemKey: chargebackItem.key,
      fileContent: Array.from(uint8Array02),
      fileName: `All Invoices - ${invoices.BillingMonth}.xlsx`,
      fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  });

  updateProgress(1);
  return result;
};
