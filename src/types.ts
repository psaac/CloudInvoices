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
  inputFieldExternalId: string;
  inputFieldCost?: string;
  inputFieldAccountId?: string;
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
  inputFieldExternalId: "",
  inputFieldCost: "",
  inputFieldAccountId: "",
};

export interface Task {
  ExternalId: string;
  Key: string;
  BatchId: string;
  BillingMonth: string;
  Summary: string;
  Cost: number;
  AccountId: string;
  // Additional fields may be present
  link?: string;
  Seller: string;
}
