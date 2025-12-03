import { invoke } from "@forge/bridge";
import { CloudData } from "../backend/CloudData";
import { AssetsAndAttrs, Settings, Task } from "../types";
// import { promises as fs, existsSync } from "fs";
// import { makeOAuthAssetPostQueryPaginated, makeOAuthAssetGetQuery } from "./Query.ts";
// import { logError, setProgress, setHasProgress, logInfo } from "./server.ts";
import { BaseProcess } from "./BaseProcess";
import { Invoices, Invoice, AppAccountCost, VendorCost } from "./Invoices";
// import { loadWithMaps, saveWithMaps } from "./FileUtils.ts";
// import { SettingsHelper } from "./SettingsHelper.ts";

class AppAccountProcess extends BaseProcess {
  applicationAssets: AssetsAndAttrs;
  chargebackAssets: AssetsAndAttrs;
  tasks: Task[];

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
  }

  /*
  private loadAssetsCache = async () => {
    logInfo("Fetching Applications from JIRA Assets...");
    // Application accounts
    this.assetsAppAccountsAttributesCache = await makeOAuthAssetGetQuery({
      workspaceId: this.WorkspaceId,
      path: `objecttype/${SettingsHelper.current().applicationObjectTypeId}/attributes`,
    });

    // Find attribute id for Account Id
    const responseAppAccountAttr = this.assetsAppAccountsAttributesCache.find(
      (attr: any) => attr.id === SettingsHelper.current().applicationObjectAttributeId
    );

    // Find Object Name in attributes
    const applicationObjectName = this.assetsAppAccountsAttributesCache[0]?.objectType.name;

    // load all application account assets in cache
    const responseAppAccount = await makeOAuthAssetPostQueryPaginated({
      workspaceId: this.WorkspaceId,
      path: `object/aql`,
      body: { qlQuery: `objectType = "${applicationObjectName}"` },
    });
    if (responseAppAccount) {
      let vendorErrors = 0;
      responseAppAccount.forEach((asset: any) => {
        const appAccountKey = asset.attributes.find(
          (attr: any) => attr.id === responseAppAccountAttr.id
        )?.objectAttributeValues[0].displayValue;
        if (appAccountKey) {
          this.assetsAppAccountsCache.set(appAccountKey, asset);
          // Check that vendor is correct
          const vendor = this.getAttributeValue(
            asset,
            SettingsHelper.current().applicationObjectAttributeVendor || "",
            this.assetsAppAccountsAttributesCache
          );
          if (!vendor || vendor === "") {
            const appName = this.getAttributeValue(
              asset,
              SettingsHelper.current().applicationObjectAttributeName || "",
              this.assetsAppAccountsAttributesCache
            );

            vendorErrors++;
            logError(
              `Warning: Application Account ${appAccountKey} - ${appName} has no vendor set in JIRA Assets`
            );
          }
        }
      });
      if (vendorErrors > 0) {
        logError(`Total of ${vendorErrors} Application Accounts have no vendor set in JIRA Assets`);
        return;
      }
    }

    setProgress(50);

    if (this.assetsAppAccountsCache.size === 0) {
      logError("No Application Accounts found in JIRA Assets");
      return;
    }

    logInfo("Fetching Chargeback Accounts from JIRA Assets...");
    // Chargeback accounts
    this.assetsChargebackAccountsAttributesCache = await makeOAuthAssetGetQuery({
      workspaceId: this.WorkspaceId,
      path: `objecttype/${SettingsHelper.current().chargebackAccountObjectTypeId}/attributes`,
    });

    // Find attribute id for Cha Id
    const responseChargebackAccountAttr = this.assetsChargebackAccountsAttributesCache.find(
      (attr: any) => attr.id === SettingsHelper.current().chargebackAccountObjectAttributeName
    );

    // Find Object Name in attributes
    const chargebackObjectName = this.assetsChargebackAccountsAttributesCache[0]?.objectType.name;

    // load all chargeback account assets in cache
    const responseChargebackAccount = await makeOAuthAssetPostQueryPaginated({
      workspaceId: this.WorkspaceId,
      path: `object/aql`,
      body: { qlQuery: `objectType = "${chargebackObjectName}"` },
    });
    if (responseChargebackAccount) {
      responseChargebackAccount.forEach((asset: any) => {
        const chargebackKey = asset.attributes.find(
          (attr: any) => attr.id === responseChargebackAccountAttr.id
        )?.objectAttributeValues[0].displayValue;
        if (chargebackKey) {
          this.assetsChargebackAccountsCache.set(chargebackKey, asset);
        }
      });
    }
    setProgress(75);

    if (this.assetsChargebackAccountsCache.size === 0) {
      logError("No Chargeback Accounts found in JIRA Assets");
      return;
    }
  };
  */

  // Helper for asset attributes
  private getAttributeValue = (asset: any, attrId: string, attributes: any[]) => {
    // First find atrribute id by name
    const attrIdFound = attributes.find((attr: any) => attr.id === attrId)?.id;
    if (!attrIdFound) return "";

    const attr = asset.attributes.find((attr: any) => attr.id === attrIdFound && attr.objectAttributeValues.length > 0);
    return attr ? attr.objectAttributeValues[0].displayValue : "";
  };

  public fillApplicationAccounts = (): { result: Invoices; taskErrors: Array<Task> } => {
    // setHasProgress(true);
    // setProgress(0);

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
    22122222;
    if (responseChargebackAccountAttr) {
      this.chargebackAssets.assets.forEach((asset: any) => {
        const chargebackKey = asset.attributes.find((attr: any) => attr.id === responseChargebackAccountAttr.id)
          ?.objectAttributeValues[0].displayValue;
        if (chargebackKey) {
          assetsChargebackAccountsCache.set(chargebackKey, asset);
        }
      });
    }

    // const outFileName = AppAccountProcess.getFileName("ApplicationAccounts-Filled", this.billingMonth);
    // const errorFileName = AppAccountProcess.getFileName("ApplicationAccounts-Errors", this.billingMonth);
    // Cleanup
    // if (existsSync(outFileName)) await fs.unlink(outFileName);
    // if (existsSync(errorFileName)) await fs.unlink(errorFileName);

    // Load issues from Jira
    // const taskFilename = AppAccountProcess.getFileName("Tasks", this.billingMonth, this.batchId);
    // if (existsSync(taskFilename)) {
    //   this.tasks = loadWithMaps<Array<Task>>(taskFilename);
    // }
    // if (this.tasks.length === 0) {
    //   logError(`No tasks found in JIRA for billing month ${this.billingMonth} and batch id ${this.batchId}`);
    //   setProgress(100);
    //   return;
    // }

    // await this.loadAssetsCache();

    // logInfo("Building pre DBT with Application/Chargeback Accounts...");
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
      filteredEntries.map((task: Task) => {
        const appAccountKey = task.AccountId;
        try {
          // Use cache
          const applicationAsset = assetsAppAccountsCache.get(appAccountKey);
          if (applicationAsset) {
            const chargebackName = this.getAttributeValue(
              applicationAsset,
              this.settings.applicationObjectAttributeChargeback || "",
              this.applicationAssets.attrs
            );
            if (chargebackName !== "") {
              // Find chargeback asset
              const chargebackAsset = assetsChargebackAccountsCache.get(chargebackName);
              if (chargebackAsset) {
                //   // Arris patch
                //   // Patch Cloud Vendor for Arris
                // const initialVendor = this.getAttributeValue(
                //   applicationAsset,
                //   this.settings.applicationObjectAttributeVendor || "",
                //   this.applicationAssets.attrs
                // );
                //   let cloudVendor = initialVendor;
                //   if (initialVendor === "Amazon Web Services") {
                //     if (
                //       this.getAttributeValue(
                //         chargebackAsset,
                //         SettingsHelper.current().chargebackAccountObjectAttributeTenant || "",
                //         this.assetsChargebackAccountsAttributesCache
                //       ) === "Arris"
                //     ) {
                //       cloudVendor = "Amazon Web Services Arris";
                //     }
                //   }

                // Find matching Invoice
                const invoice = result.Invoices.get(chargebackAsset.id) || {
                  CustomerId: chargebackAsset.id,
                  BillingMonth: this.billingMonth,
                  Customer: chargebackName,
                  CostCenter: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeChargeCC || "",
                    this.chargebackAssets.attrs
                  ),
                  Owner: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeOwner || "",
                    this.chargebackAssets.attrs
                  ),
                  Controller: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeFinancialController || "Financial Controller",
                    this.chargebackAssets.attrs
                  ),
                  BusinessUnit: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeBusinessUnit || "Business Unit",
                    this.chargebackAssets.attrs
                  ),
                  Tenant: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeTenant || "",
                    this.chargebackAssets.attrs
                  ),
                  ReportingUnit: this.getAttributeValue(
                    chargebackAsset,
                    this.settings.chargebackAccountObjectAttributeReportingUnit || "",
                    this.chargebackAssets.attrs
                  ),
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
                  this.settings.applicationObjectAttributeName || "",
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
      });
      // Write output files
      //   saveWithMaps(result, outFileName);

      //   if (taskErrors.length > 0) await fs.writeFile(errorFileName, JSON.stringify(taskErrors, null, 2), "utf-8");

      //   setProgress(100);

      return { result, taskErrors };
    } catch (error) {
      // logError(`Failed to fill application accounts with error : ${error}`);
      throw error;
    }
  };

  //   public static getFileName = (mask: string, billingMonth: string) => {
  //     const dir = `./data/${billingMonth}`;
  //     if (!existsSync(dir)) {
  //       fs.mkdir(dir, { recursive: true });
  //     }
  //     return `${dir}/${billingMonth}-${mask}.json`;
  //   };
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

export const fillApplicationAccounts = ({
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
}): { result: Invoices; taskErrors: Array<Task> } => {
  const processor = new AppAccountProcess(billingMonth, applicationAssets, chargebackAssets, tasks, settings);
  return processor.fillApplicationAccounts();
};
