export interface ServerInfo {
  baseUrl: string;
  version: string;
  buildNumber: number;
}

export const emptyServerInfo: ServerInfo = {
  baseUrl: "",
  version: "",
  buildNumber: 0,
};

export interface Settings {
  appVersion: string;
  spaceId: string;
  roleId: string;
  taskWorkTypeId: string;
  targetWorkTypeId: string;
  invoiceWorkTypeId: string;
  workSpaceId: string;
  objectSchemaId: string;
  applicationObjectTypeId: string;
  chargebackAccountObjectTypeId: string;
  applicationObjectAttributeId: string;
  applicationObjectAttributeName: string;
  applicationObjectAttributeVendor: string;
  applicationObjectAttributeChargeback: string;
  chargebackAccountObjectAttributeName: string;
  chargebackAccountObjectAttributeChargeCC: string;
  chargebackAccountObjectAttributeChargeLE: string;
  chargebackAccountObjectAttributeBusinessUnit: string;
  chargebackAccountObjectAttributeTenant: string;
  chargebackAccountObjectAttributeOwner: string;
  chargebackAccountObjectAttributeFinancialController: string;
  chargebackAccountObjectAttributeAdministrator: string;
  chargebackAccountObjectAttributeAlternativeAdministrators: string;
  chargebackAccountObjectAttributeAdditionalContacts: string;
  chargebackAccountObjectAttributeReportingUnit: string;
  chargebackAccountObjectAttributeSAPAccount: string;
  // vendorObjectTypeId: string;
  // tenantObjectTypeId: string;
  peopleObjectTypeId: string;
  peopleObjectAttributeEmail: string;
  sharedCostsAccounts: string;
  defaultChargeLE: string;
  defaultSAPAccount: string;
  defaultCostCenter: string;
  defaultVendor: string;
  invoicePrefix: string;
  // Jira Fields
  inputFieldBatchId: string;
  inputFieldBillingMonth: string;
  inputFieldCloudVendor: string;
  inputFieldChargebackId: string;
  inputFieldEmailsToNotify: string;
}

export const DefaultSettings: Settings = {
  appVersion: "",
  spaceId: "",
  roleId: "",
  taskWorkTypeId: "",
  targetWorkTypeId: "",
  invoiceWorkTypeId: "",
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
  chargebackAccountObjectAttributeChargeLE: "",
  chargebackAccountObjectAttributeBusinessUnit: "",
  chargebackAccountObjectAttributeTenant: "",
  chargebackAccountObjectAttributeOwner: "",
  chargebackAccountObjectAttributeFinancialController: "",
  chargebackAccountObjectAttributeAdministrator: "",
  chargebackAccountObjectAttributeAlternativeAdministrators: "",
  chargebackAccountObjectAttributeAdditionalContacts: "",
  chargebackAccountObjectAttributeReportingUnit: "",
  chargebackAccountObjectAttributeSAPAccount: "",
  // vendorObjectTypeId: "",
  // tenantObjectTypeId: "",
  peopleObjectTypeId: "",
  peopleObjectAttributeEmail: "",
  sharedCostsAccounts: "",
  defaultChargeLE: "L323 (PS4)",
  defaultSAPAccount: "6226110000",
  defaultCostCenter: "2013236L03",
  defaultVendor: "VLE3211",
  invoicePrefix: "CGB",
  inputFieldBatchId: "",
  inputFieldBillingMonth: "",
  inputFieldCloudVendor: "",
  inputFieldChargebackId: "",
  inputFieldEmailsToNotify: "",
};

export const validSettings = (settings: Settings): boolean => {
  return Object.keys(settings).every((key) => key === "sharedCostsAccounts" || settings[key as keyof Settings] !== "");
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

export interface Option {
  value: string;
  label: string;
}

export interface Options extends Array<Option> {}
