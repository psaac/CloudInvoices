export interface Settings {
  spaceId?: string;
  taskWorkTypeId?: string;
  targetWorkTypeId?: string;
  workSpaceId?: string;
  objectSchemaId?: string;
  applicationObjectTypeId?: string;
  chargebackAccountObjectTypeId?: string;
  applicationObjectAttributeId?: string;
  applicationObjectAttributeName?: string;
  applicationObjectAttributeVendor?: string;
  applicationObjectAttributeChargeback?: string;
  chargebackAccountObjectAttributeName?: string;
  chargebackAccountObjectAttributeChargeCC?: string;
  chargebackAccountObjectAttributeBusinessUnit?: string;
  chargebackAccountObjectAttributeTenant?: string;
  chargebackAccountObjectAttributeOwner?: string;
  chargebackAccountObjectAttributeFinancialController?: string;
  chargebackAccountObjectAttributeReportingUnit?: string;
  vendorObjectTypeId?: string;
  tenantObjectTypeId?: string;
  sharedCostsAccounts?: string;
  // Jira Fields
  inputFieldBatchId?: string;
  inputFieldBillingMonth?: string;
  inputFieldCloudVendor?: string;
}

export const DefaultSettings: Settings = {
  spaceId: "",
  taskWorkTypeId: "",
  targetWorkTypeId: "",
  workSpaceId: "",
  objectSchemaId: "",
  applicationObjectTypeId: "",
  chargebackAccountObjectTypeId: "",
  applicationObjectAttributeId: "",
  applicationObjectAttributeName: "",
  applicationObjectAttributeChargeback: "",
  applicationObjectAttributeVendor: "",
  chargebackAccountObjectAttributeName: "",
  chargebackAccountObjectAttributeChargeCC: "",
  chargebackAccountObjectAttributeBusinessUnit: "",
  chargebackAccountObjectAttributeTenant: "",
  chargebackAccountObjectAttributeOwner: "",
  chargebackAccountObjectAttributeFinancialController: "",
  chargebackAccountObjectAttributeReportingUnit: "",
  vendorObjectTypeId: "",
  tenantObjectTypeId: "",
  sharedCostsAccounts: "",
  inputFieldBatchId: "",
  inputFieldBillingMonth: "",
  inputFieldCloudVendor: "",
};

export interface Task {
  Summary: string;
  Cost: number;
  AccountId: string;
  // Additional fields may be present
  CloudVendor: string;
  link?: string;
  Seller: string;
  Error?: string;
}

export interface AssetsAndAttrs {
  attrs: Array<{ id: string; name: string }>;
  assets: Array<any>;
}
