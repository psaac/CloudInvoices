import { invoke } from "@forge/bridge";
import { Settings, Task } from "../types";
import { saveWithMapsFromRaw } from "../backend/Utils";
import { getChargebackIdStr, InvoiceLine } from "../backend/InvoiceLine";

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
  TotalByVendor: Map<string, number>; // Key is Vendor Name
  Invoices: Map<string, Invoice>; // Key is CustomerId
}

export const generateInvoicesAndIDFiles = async ({
  settings,
  invoices,
  baseUrl,
  updateProgress,
}: {
  settings: Settings;
  invoices: Invoices;
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
    (attr: any) => attr.id === settings.legalEntityObjectAttributeCode
  ).objectAttributeValues[0].value;
  const defaultLegalEntitySystem = defaultLegalEntityAsset.attributes.find(
    (attr: any) => attr.id === settings.legalEntityObjectAttributeSystem
  ).objectAttributeValues[0].value;

  const result: Array<InvoiceLine> = [];
  // Create JIRA Work item to store Invoices (as sub-tasks) & ID Files
  const mainSummary = `Chargeback Invoices & IDocs Files - ${invoices.BillingMonth}`;
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
    // break; // Debug: process only first invoice
  }
  updateProgress(1);
  return result;
};
