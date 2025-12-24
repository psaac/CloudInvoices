import { invoke } from "@forge/bridge";
import { CloudData } from "../backend/CloudData";
import { AssetsAndAttrs, Settings, Task } from "../types";
import { BaseProcess } from "./BaseProcess";
import { Invoices, Invoice, AppAccountCost, VendorCost } from "./Invoices";
// import { Assets } from "../backend/Assets";

class AppAccountProcess extends BaseProcess {
  applicationAssets: AssetsAndAttrs;
  chargebackAssets: AssetsAndAttrs;
  tasks: Task[];
  peopleCache: Map<string, any>;

  constructor(
    billingMonth: string,
    applicationAssets: AssetsAndAttrs,
    chargebackAssets: AssetsAndAttrs,
    tasks: Array<Task>,
    settings: Settings
  ) {
    super(billingMonth, settings);
    this.tasks = tasks;
    this.applicationAssets = applicationAssets;
    this.chargebackAssets = chargebackAssets;
    this.peopleCache = new Map<string, any>();
  }

  // Helper for asset attributes
  private getAttribute = (asset: any, attrId: string, attributes: any[]) => {
    // First find atrribute id by name
    const attrIdFound = attributes.find((attr: any) => attr.id === attrId)?.id;
    if (!attrIdFound) return null;

    return asset.attributes.find((attr: any) => attr.id === attrIdFound && attr.objectAttributeValues.length > 0);
  };

  private getAttributeValue = (asset: any, attrId: string, attributes: any[]) => {
    const attr = this.getAttribute(asset, attrId, attributes);
    return attr ? attr.objectAttributeValues[0].displayValue : "";
  };

  private getAttributeValues = (asset: any, attrId: string, attributes: any[]): Array<string> => {
    const attr = this.getAttribute(asset, attrId, attributes);
    return attr ? attr.objectAttributeValues.map((val: any) => val.displayValue) : [];
  };

  public fillApplicationAccounts = async (): Promise<{ result: Invoices; taskErrors: Array<Task> }> => {
    const result: Invoices = {
      BillingMonth: this.billingMonth,
      TotalAmount: 0,
      NetworkSharedCosts: 0,
      Invoices: new Map<string, Invoice>(),
      TotalByVendor: new Map<string, number>(),
    };
    const taskErrors: Array<Task> = [];

    // Build asset cache
    // Find attribute id for Account Id
    const assetsAppAccountsCache = new Map<string, any>();
    const responseAppAccountAttr = this.applicationAssets.attrs.find(
      (attr: any) => attr.id === this.settings.applicationObjectAttributeId
    );
    if (responseAppAccountAttr) {
      this.applicationAssets.assets.forEach((asset: any) => {
        const appAccountKey = asset.attributes.find((attr: any) => attr.id === responseAppAccountAttr.id)
          ?.objectAttributeValues[0].displayValue;
        if (appAccountKey) {
          assetsAppAccountsCache.set(appAccountKey, asset);
        }
      });
    }

    // Find attribute id for Cha Id
    const responseChargebackAccountAttr = this.chargebackAssets.attrs.find(
      (attr: any) => attr.id === this.settings.chargebackAccountObjectAttributeName
    );
    const assetsChargebackAccountsCache = new Map<string, any>();
    if (responseChargebackAccountAttr) {
      this.chargebackAssets.assets.forEach((asset: any) => {
        const chargebackKey = asset.attributes.find((attr: any) => attr.id === responseChargebackAccountAttr.id)
          ?.objectAttributeValues[0].displayValue;
        if (chargebackKey) {
          assetsChargebackAccountsCache.set(chargebackKey, asset);
        }
      });
    }

    try {
      // First exclude applications which have null cost
      const costsByAppId: Map<string, number> = new Map<string, number>();
      this.tasks.forEach((task) => {
        const existingCost = costsByAppId.get(task.AccountId) || 0;
        costsByAppId.set(task.AccountId, existingCost + task.Cost);
      });
      costsByAppId.forEach((cost, appId) => {
        if (cost <= 0) {
          //   logInfo(`Excluding Application Account ${appId} with total cost of 0`);
          this.tasks = this.tasks.filter((task) => task.AccountId !== appId);
        }
      });

      // Exclude tasks with empty account id
      const filteredEntries = this.tasks.filter((entry) => entry.AccountId);
      //   filteredEntries.splice(0, filteredEntries.length - 2); // For testing errors

      // Skip empty subscription or account id
      // filteredEntries.map(async (task: Task) => {
      for (const task of filteredEntries) {
        const appAccountKey = task.AccountId;
        try {
          // Use cache
          const applicationAsset = assetsAppAccountsCache.get(appAccountKey);
          if (applicationAsset) {
            const chargebackName = this.getAttributeValue(
              applicationAsset,
              this.settings.applicationObjectAttributeChargeback,
              this.applicationAssets.attrs
            );
            if (chargebackName !== "") {
              // Find chargeback asset
              const chargebackAsset = assetsChargebackAccountsCache.get(chargebackName);
              if (chargebackAsset) {
                let SAPAccount = this.getAttributeValue(
                  chargebackAsset,
                  this.settings.chargebackAccountObjectAttributeSAPAccount,
                  this.chargebackAssets.attrs
                );
                if (!SAPAccount || SAPAccount.trim() === "") {
                  SAPAccount = this.settings.defaultSAPAccount;
                }

                // Retreive emails to notify from :
                // - Chargeback owner attribute
                // - Chargeback Finance controller attribute
                // - Chargeback Administrator attribute
                // - Chargeback Alternate Administrator attribute
                // - Chargeback Additionnal contacts attribute
                const getEmails = async (attributeId: string) => {
                  const attr = this.getAttribute(chargebackAsset, attributeId, this.chargebackAssets.attrs);
                  const values = attr?.objectAttributeValues ?? [];

                  const emailArrays = await Promise.all(
                    values.map(async (val: any) => {
                      const referencedObject = val.referencedObject;
                      if (!referencedObject) return null;

                      // load email from referenced object id
                      if (!this.peopleCache.has(referencedObject.id)) {
                        const people = await invoke("getAssetById", {
                          settings: this.settings,
                          assetId: referencedObject.id,
                        });
                        this.peopleCache.set(referencedObject.id, people);
                      }
                      const asset = this.peopleCache.get(referencedObject.id);

                      const emailAttr = asset.attributes.find(
                        (attr: any) => attr.id === this.settings.peopleObjectAttributeEmail
                      );
                      if (emailAttr && emailAttr.objectAttributeValues.length > 0) {
                        return emailAttr.objectAttributeValues[0].value || null;
                      }
                      return null;
                    })
                  );

                  return emailArrays.filter((email): email is string => email !== null);
                };
                const emailLists = await Promise.all([
                  getEmails(this.settings.chargebackAccountObjectAttributeOwner),
                  getEmails(this.settings.chargebackAccountObjectAttributeFinancialController),
                  getEmails(this.settings.chargebackAccountObjectAttributeAdministrator),
                  getEmails(this.settings.chargebackAccountObjectAttributeAlternativeAdministrators),
                  this.getAttributeValues(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeAdditionalContacts,
                    this.chargebackAssets.attrs
                  ),
                ]);
                const emailsToNotify = [...new Set(emailLists.flat())]; // Unique emails
                // TODO : load additionnal contacts from a multi value attribute
                // Find matching Invoice
                const invoice = result.Invoices.get(chargebackAsset.id) || {
                  CustomerId: chargebackAsset.id,
                  BillingMonth: this.billingMonth,
                  Customer: chargebackName,
                  CostCenter: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeChargeCC,
                    this.chargebackAssets.attrs
                  ),
                  ChargeLE: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeChargeLE,
                    this.chargebackAssets.attrs
                  ),
                  Owner: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeOwner,
                    this.chargebackAssets.attrs
                  ),
                  Controller: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeFinancialController,
                    this.chargebackAssets.attrs
                  ),
                  emailsToNotify,
                  BusinessUnit: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeBusinessUnit,
                    this.chargebackAssets.attrs
                  ),
                  Tenant: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeTenant,
                    this.chargebackAssets.attrs
                  ),
                  ReportingUnit: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeReportingUnit,
                    this.chargebackAssets.attrs
                  ),
                  SAPAccount,
                  Date: "",
                  CostsByVendor: new Map<string, VendorCost>(),
                  TotalAmount: 0,
                  TotalByAppAccount: new Map<string, AppAccountCost>(),
                };

                // Then find Vendor Cost in Invoice
                const vendorCost = invoice.CostsByVendor.get(task.CloudVendor) || {
                  Vendor: task.CloudVendor,
                  TotalAmount: 0,
                  CostsByAppAccount: new Map<string, AppAccountCost>(),
                };

                const appName = this.getAttributeValue(
                  applicationAsset,
                  this.settings.applicationObjectAttributeName,
                  this.applicationAssets.attrs
                );
                // Finally find Vendor Cost in App Account
                const appAccountCost = vendorCost.CostsByAppAccount.get(appAccountKey) || {
                  AppId: appAccountKey,
                  AppName: appName,
                  Tasks: [] as Task[],
                  TotalAmount: 0,
                };

                task.Seller = task.CloudVendor;
                task.Cost = task.Cost;
                appAccountCost.Tasks.push(task);
                vendorCost.TotalAmount += task.Cost;
                appAccountCost.TotalAmount += task.Cost;
                const existingTotalByAppAccount = invoice.TotalByAppAccount.get(appAccountKey) || {
                  AppId: appAccountKey,
                  AppName: appName,
                  TotalAmount: 0,
                  Tasks: [],
                };
                existingTotalByAppAccount.TotalAmount += task.Cost;
                invoice.TotalByAppAccount.set(appAccountKey, existingTotalByAppAccount);
                invoice.TotalAmount += task.Cost;

                vendorCost.CostsByAppAccount.set(appAccountKey, appAccountCost);
                invoice.CostsByVendor.set(task.CloudVendor, vendorCost);
                result.Invoices.set(chargebackAsset.id, invoice);
              } else {
                task.Error = `Chargeback Asset ${chargebackName} not found for Application Account ${appAccountKey}`;
                taskErrors.push(task);
              }
            } else {
              task.Error = `No Chargeback Account set for Application Account ${appAccountKey}`;
              taskErrors.push(task);
            }
          } else {
            task.Error = `Application Account ${appAccountKey} not found in JIRA Assets`;
            taskErrors.push(task);
          }
        } catch (error: any) {
          task.Error = `Error processing entry ${appAccountKey} with error : ${error.message}`;
          taskErrors.push(task);
        }
      }

      return { result, taskErrors };
    } catch (error) {
      throw error;
    }
  };
}

export const loadTasks = async (cloudData: CloudData): Promise<Array<Task>> => {
  const dataFile = await invoke<string>("getAttachment", {
    attachmentId: cloudData.Attachments[0]?.id,
    baseUrl: cloudData.Link.split("/browse/")[0],
  });

  if (!dataFile) {
    console.error(`No attachment found for ${cloudData.Key}`);
    return [];
  }

  // Parse Data
  const tasks: Task[] = JSON.parse(dataFile);
  tasks.forEach((task) => {
    // Add Cloud Vendor info
    task.CloudVendor = cloudData.CloudVendor.value;
  });

  return tasks;
};

export const fillApplicationAccounts = async ({
  billingMonth,
  applicationAssets,
  chargebackAssets,
  tasks,
  settings,
}: {
  billingMonth: string;
  applicationAssets: AssetsAndAttrs;
  chargebackAssets: AssetsAndAttrs;
  tasks: Array<Task>;
  settings: Settings;
}): Promise<{ result: Invoices; taskErrors: Array<Task> }> => {
  const processor = new AppAccountProcess(billingMonth, applicationAssets, chargebackAssets, tasks, settings);
  return await processor.fillApplicationAccounts();
};
