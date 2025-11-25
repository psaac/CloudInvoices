// Note : FN stands for Field Name
export const SETTINGS = {
  // lowercase !important
  LOG_LEVEL: "debug",

  PROJECT_KEY: "TRAIN",
  WORKSPACE_ID: "be974a53-dacb-4d9a-8819-b45c437474cb", // This is the ID of the Assets workspace
  CHARGEBACK_PROJECTROLE_ID: 10081,
  PROCESS_COUNT: 20,
  CHARGEBACK_ACCOUNT_ASSET_ID: "129",
  CHARGEBACK_VENDOR_ASSET_ID: "137",
  CHARGEBACKIN_WORKTYPE_NAME: "ChargebackIn",
  CHARGEBACKOUT_WORKTYPE_NAME: "ChargebackOut",
  CHARGEBACKLINEOUT_WORKTYPE_NAME: "ChargebackLineOut",
  CHARGEBACKGROUP_OUT_WORKTYPE_NAME: "ChargebackGroupOut",
  CHARGEBACK_GROUP_LINK_ID: "10072",
  CHARGEBACK_GROUP_LINK_NAME: "Chargeback Group",
  CHARGEBACK_GROUP_LINE_LINK_ID: "10071",
  CHARGEBACK_GROUP_LINE_LINK_NAME: "Chargeback Line",
  RELATES_LINK_NAME: "Relates",
  CUSTOMFIELDS_IDS: {
    BillingMonth: "customfield_10153",
    ApplicationAccountAsset: "customfield_10081",
    ApplicationAccountId: "customfield_10082",
    ChargebackAccountAsset: "customfield_10163",
    VendorAsset: "customfield_10197",
    Cost: "customfield_10151",
    DebitCredit: "customfield_10198",
  },
  FN_CHARGEBACK_ASSET: "Asset Chargeback Account",
  FN_APPLICATION_ASSET: "Asset Application Account",
  STATUS_ASSET_OK: "Asset OK",
  STATUS_ASSET_ERROR: "Asset Error",
  STATUS_NEW: "New",
  STATUS_DONE: "Done",
  SHARED_COST_ACCOUNT_NAMES: ["corp-it-cloudops-shared", "ARRIS-Ungrouped"],
};
