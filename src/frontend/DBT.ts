import { BaseProcess } from "./BaseProcess";
import { Invoice, Invoices, VendorCost, AppAccountCost } from "./Invoices";
import { round2 } from "../backend/Utils";
import { Settings } from "../types";

class DBTProcess extends BaseProcess {
  invoices: Invoices;
  constructor(settings: Settings, invoices: Invoices) {
    super(invoices.BillingMonth, settings);
    this.invoices = invoices;
  }

  private isNetworkSharedCost = (invoice: Invoice): boolean => {
    return this.settings.sharedCostsAccounts?.includes(invoice.Customer) || false;
  };

  generateDBT = () => {
    // Extract vendors
    const sharedCostsByVendor = new Map<string, number>();
    this.invoices.TotalAmount = 0;
    this.invoices.Invoices.forEach((invoice: Invoice) => {
      try {
        invoice.CostsByVendor.forEach((vendorCost: VendorCost, cloudVendor) => {
          if (this.isNetworkSharedCost(invoice)) {
            const existingCosts = sharedCostsByVendor.get(vendorCost.Vendor) || 0;
            sharedCostsByVendor.set(vendorCost.Vendor, existingCosts + vendorCost.TotalAmount);
            this.invoices.NetworkSharedCosts += vendorCost.TotalAmount;
          } else if (!invoice.Ignore) {
            let existing = this.invoices.TotalByVendor.get(cloudVendor) || 0;
            this.invoices.TotalByVendor.set(cloudVendor, existing + vendorCost.TotalAmount);
            this.invoices.TotalAmount += vendorCost.TotalAmount;
          }
        });
        // Remove invoice from list
        if (this.isNetworkSharedCost(invoice) || invoice.Ignore) {
          this.invoices.Invoices.delete(invoice.CustomerId);
        }
      } catch (error: any) {
        // logError(`Error processing invoice of ${invoice.Customer} with error : ${error.message}`);
        throw new Error(`Error processing invoice of ${invoice.Customer} with error : ${error.message}`);
      }
    });
    // logInfo(`Grand Total : ${invoices.TotalAmount}`);
    // logInfo(`Total by vendor : ${Array.from(invoices.TotalByVendor.entries())}`);
    // logInfo(`Shared costs : ${Array.from(sharedCostsByVendor.entries())}`);

    const CLOUD_NETWORK_SHARED_COST = "Cloud Network Shared Cost";
    const CLOUD_SECURITY_VENDOR = "Cloud Security";

    // Then compute shared costs by Shared Cost "Customer" (ie. ARRIS-Ungrouped), then by vendor and account
    sharedCostsByVendor.forEach((sharedCost, vendorName) => {
      //   let allocatedNetworkCost = 0;
      // For each customer

      this.invoices.Invoices.forEach((invoice) => {
        invoice.CostsByVendor.forEach((vendorCost) => {
          // Check if vendor matches
          if (vendorCost.Vendor === vendorName) {
            vendorCost.CostsByAppAccount.forEach((appAccountCost, appId) => {
              // Find total cost of this vendor to compute weight and apply shared cost
              const sharedNetworkCost = round2(
                (appAccountCost.TotalAmount / (this.invoices.TotalByVendor.get(vendorName) || 1)) * sharedCost,
              );
              //   allocatedNetworkCost += sharedNetworkCost;

              // Generate Task Entry (there is only one per app account)
              const description = `Cloud Network Shared-${vendorName}`;
              const existingVendorCost = invoice.CostsByVendor.get(CLOUD_NETWORK_SHARED_COST) || {
                Vendor: CLOUD_NETWORK_SHARED_COST,
                TotalAmount: 0,
                CostsByAppAccount: new Map<string, AppAccountCost>(),
              };
              existingVendorCost.TotalAmount += sharedNetworkCost;
              // Add vendor cost for App Account
              existingVendorCost.CostsByAppAccount.set(appId, {
                AppId: appAccountCost.AppId,
                AppName: appAccountCost.AppName,
                TotalAmount: sharedNetworkCost,
                Tasks: [
                  {
                    u_product_code: description,
                    u_cost: sharedNetworkCost,
                    Seller: "Cloud-Shared-Costs",
                    u_account_id: appAccountCost.AppId,
                    CloudVendor: CLOUD_NETWORK_SHARED_COST,
                    BatchId: "",
                  },
                ],
              });

              const existingTotalByAppAccount = invoice.TotalByAppAccount.get(appId);
              if (existingTotalByAppAccount) {
                existingTotalByAppAccount.TotalAmount += sharedNetworkCost;
                invoice.TotalByAppAccount.set(appId, existingTotalByAppAccount);
              } else {
                // logError(
                //   `Error: App Account ${appId} not found in invoice ${invoice.Customer} when adding shared network cost to TotalByAppAccount`
                // );
                throw new Error(
                  `Error: App Account ${appId} not found in invoice ${invoice.Customer} when adding shared network cost to TotalByAppAccount`,
                );
              }

              invoice.TotalAmount += sharedNetworkCost;
              invoice.CostsByVendor.set(CLOUD_NETWORK_SHARED_COST, existingVendorCost);
            });
          }
        });
      });
      // Check that all shared costs have been allocated (Possible rounding issues)
      /*
      const firstKey = Array.from(invoices.Invoices.keys()).shift() || "";
      if (firstKey !== "" && invoices.Invoices.has(firstKey)) {
        const firstInvoice = invoices.Invoices.get(firstKey);
        const firstAppAccountCost = firstInvoice?.CostsByAppAccount.values().next().value;
        const firstSharedCost = firstAppAccountCost?.CostsByVendor.get(vendorName)? || null;
        if (firstSharedCost && firstSharedCost.Tasks.length > 0) {
          const difference = round2(sharedCost - allocatedNetworkCost);
          if (difference !== 0) {
            console.log(
              `Adjusting shared Network cost for vendor ${vendorName} by : ${difference}`
            );
            // Adjust last entry
            firstSharedCost.Tasks[0].Cost = round2(firstSharedCost.Cost + difference);
            firstSharedCost.totalAmount = round2(firstSharedCost.TotalAmount + difference);
            allocatedNetworkCost += difference;
          }
        }
      }
        */

      // Check that all shared costs have been allocated
      //   logInfo(
      //     `Shared Network cost for vendor ${sharedCost} : ${sharedCost} allocated : ${allocatedNetworkCost} difference : ${round2(
      //       sharedCost - allocatedNetworkCost
      //     )}`
      //   );
    });

    // Add Shared Security costs : When adding security shared costs, weight is computed on total costs including network shared costs
    // let allocatedSecurityCost = 0;
    this.invoices.Invoices.forEach((invoice) => {
      // For each app account, compute shared security cost
      invoice.TotalByAppAccount.forEach((appAccountCost, appId) => {
        // Find weight
        const sharedSecurityCost = round2(
          (appAccountCost.TotalAmount / (this.invoices.TotalAmount + this.invoices.NetworkSharedCosts)) *
            this.invoices.SecuritySharedCosts,
        );
        // allocatedSecurityCost += sharedSecurityCost;

        // Add Security shared cost entry
        const description = `Cloud security recharge-${invoice.Customer}`;
        const existingVendorCost = invoice.CostsByVendor.get(CLOUD_SECURITY_VENDOR) || {
          Vendor: CLOUD_SECURITY_VENDOR,
          TotalAmount: 0,
          CostsByAppAccount: new Map<string, AppAccountCost>(),
        };
        existingVendorCost.TotalAmount += sharedSecurityCost;
        existingVendorCost.CostsByAppAccount.set(appId, {
          AppId: appAccountCost.AppId,
          AppName: appAccountCost.AppName,
          TotalAmount: sharedSecurityCost,
          Tasks: [
            {
              u_product_code: description,
              u_cost: sharedSecurityCost,
              Seller: "Cloud-Security",
              u_account_id: appAccountCost.AppId,
              CloudVendor: CLOUD_SECURITY_VENDOR,
              BatchId: "",
            },
          ],
        });
        invoice.TotalAmount += sharedSecurityCost;
        invoice.CostsByVendor.set(CLOUD_SECURITY_VENDOR, existingVendorCost);
      });
    });
    // // Check that all shared costs have been allocated (Possible rounding issues)
    // const firstKey = Array.from(dbtEntries.keys()).shift() || "";
    // if (firstKey !== "" && dbtEntries.has(firstKey)) {
    //   const firstCustomer = dbtEntries.get(firstKey);
    //   const firstEntry = firstCustomer?.get(CLOUD_SECURITY_VENDOR)?.[0] || null;
    //   if (firstEntry) {
    //     const difference = round2(this.cloudSecurityTotalCost - allocatedSecurityCost);
    //     if (difference !== 0) {
    //       console.log(`Adjusting shared Security cost by : ${difference}`);
    //       // Adjust last entry
    //       firstEntry.Amount = round2(firstEntry.Amount + difference);
    //       allocatedSecurityCost += difference;
    //     }
    //   }
    // }
    // logInfo(
    //   `Shared Security costs : ${allocatedSecurityCost} difference : ${round2(
    //     this.cloudSecurityTotalCost - allocatedSecurityCost
    //   )}`
    // );

    this.invoices.GrandTotal =
      this.invoices.TotalAmount + this.invoices.NetworkSharedCosts + this.invoices.SecuritySharedCosts;

    return this.invoices;
  };
}

export const generateDBT = (settings: Settings, invoices: Invoices) => {
  const processor = new DBTProcess(settings, invoices);
  return processor.generateDBT();
};
