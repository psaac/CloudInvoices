import { GenerateInvoicesParams } from "./types";
import { searchWorkItems } from "./jira/search";
import { SETTINGS } from "./consts";
import { getAsset } from "./jira/assets";

interface Cost {
  Microsoft: number;
  AWS: number;
}

const getDistributedAndTotalCosts = async ({
  billingMonth,
}: {
  billingMonth: string;
}): Promise<{ sharedCostsByAccount: Map<string, Cost>; totalCostsByVendor: Cost }> => {
  // Get all shared costs for the billing month
  // For AWS and Microsoft Azure, get costs of both accounts "corp-it-cloudops-shared" and "ARRIS-Ungrouped"
  // Fetch work items linked to these costs
  let sharedCostsByAccount = new Map<string, Cost>([
    ["corp-it-cloudops-shared", { Microsoft: 0, AWS: 0 }],
    ["ARRIS-Ungrouped", { Microsoft: 0, AWS: 0 }],
  ]);

  let totalCostsByVendor: { Microsoft: number; AWS: number } = {
    Microsoft: 0,
    AWS: 0,
  };

  const workItems = await searchWorkItems({
    // jql: `"Billing Month" ~ ${billingMonth} AND issuetype = ${SETTINGS.CHARGEBACKIN_WORKTYPE_NAME} AND "${SETTINGS.FN_APPLICATION_ASSET}" in aqlFunction('"Chargeback Account" = ${accountName}')`,
    jql: `"Billing Month" ~ ${billingMonth} AND issuetype = ${SETTINGS.CHARGEBACKIN_WORKTYPE_NAME} AND status = "${SETTINGS.STATUS_DONE}"`,
    fields: ["summary", SETTINGS.CUSTOMFIELDS_IDS.Cost, SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountAsset],
  });
  // Process shared costs as needed
  for (const workItem of workItems) {
    // Get linked asset
    const appAccountAsset = workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountAsset];
    const asset = await getAsset({
      assetId: appAccountAsset[0].objectId,
    });

    // Get Vendor
    const vendorAttr = asset.attributes.find(
      (attr: any) => attr.objectTypeAttribute.referenceObjectType?.name === "Vendor"
    );
    if (vendorAttr) {
      const vendorName = vendorAttr.objectAttributeValues[0].displayValue;
      const vendorKey = (vendorName === "Amazon Web Services" ? "AWS" : vendorName) as keyof Cost;

      // Get Chargeback account
      const chargebackAttr = asset.attributes.find(
        (attr: any) => attr.objectTypeAttribute.referenceObjectType?.name === "Chargeback Account"
      );
      if (!chargebackAttr) throw new Error(`Chargeback Account attribute not found for work item : ${workItem.key}`);

      const chargebackName = chargebackAttr.objectAttributeValues[0].displayValue;
      // If chargeback account is one of the shared cost accounts, accumulate costs by vendor
      if (SETTINGS.SHARED_COST_ACCOUNT_NAMES.includes(chargebackName)) {
        switch (vendorKey) {
          case "AWS":
            sharedCostsByAccount.get(chargebackName)!.AWS += workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost];
            break;
          case "Microsoft":
            sharedCostsByAccount.get(chargebackName)!.Microsoft += workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost];
            break;
          default:
            // Handle other vendors if necessary
            throw new Error(`Unsupported vendor for shared costs: ${vendorName}`);
        }
      } else {
        // Sum costs for other accounts
        totalCostsByVendor[vendorKey] += workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost];
      }
    }
  }
  //   sharedCostsByAccount.forEach((value, key) => {
  //     console.log("Computed shared costs by account:", key, JSON.stringify(value));
  //   });
  //   console.log("Computed total costs by vendor:", JSON.stringify(totalCostsByVendor));

  return { sharedCostsByAccount, totalCostsByVendor };
};

export const computeSharedCosts = async (params: GenerateInvoicesParams) => {
  const billingMonth = params.billingMonth || new Date().toISOString().slice(0, 7);
  // Get distributed costs
  const { sharedCostsByAccount, totalCostsByVendor } = await getDistributedAndTotalCosts({ billingMonth });
  console.log("Shared costs by account:", JSON.stringify([...sharedCostsByAccount]));
  console.log("Total costs by vendor:", JSON.stringify(totalCostsByVendor));

  // For each chargeback, compute its share of the shared costs based on its proportion of the total costs.
  const chargebackOuts = await searchWorkItems({
    jql: `"Billing Month" ~ ${billingMonth} AND issuetype = ${SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME}`,
    fields: [
      "summary",
      SETTINGS.CUSTOMFIELDS_IDS.Cost,
      //   SETTINGS.CUSTOMFIELDS_IDS.ChargebackAccountAsset,
      //   SETTINGS.CUSTOMFIELDS_IDS.DebitCredit,
    ],
  });
  for (const chargebackOut of chargebackOuts) {
    // Get Microsoft and AWS costs for this chargeback and compute weight

    // Compute share of shared costs
    const originalCost = chargebackOut.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost];
    // For simplicity, let's assume equal distribution for now
    // In real scenario, compute based on proportion of total costs
    const sharedCostShare = 0; // Placeholder for computed shared cost share
    const newCost = originalCost + sharedCostShare;
    console.log(
      `Chargeback Out ${chargebackOut.key} original cost: ${originalCost}, shared cost share: ${sharedCostShare}, new cost: ${newCost}`
    );
    // Here, you would update the chargebackOut work item with the new cost if needed
  }

  console.log("Chargeback outs to process for shared costs distribution:", JSON.stringify(chargebackOuts));
};
