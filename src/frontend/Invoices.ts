import { Task } from "../types";

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
  ChargebackId?: string; // To be generated
  CustomerId: string; // Chargeback Account ID
  Customer: string; // Project on invoice
  BillingMonth: string;
  Date: string; // Invoice date
  CostCenter: string; // Charge CC
  Owner: string; // Chargeback Owner
  Controller: string; // Chargeback Finance Controller
  BusinessUnit: string; // Chargeback Business Unit
  Tenant: string; // Chargeback Tenant
  ReportingUnit: string; // Chargeback Reporting Unit
  TotalAmount: number | 0;
  CostsByVendor: Map<string, VendorCost>; // Key is Vendor Name
  TotalByAppAccount: Map<string, AppAccountCost>; // Key is Application Account ID
}

export interface Invoices {
  BillingMonth: string;
  TotalAmount: number | 0;
  NetworkSharedCosts: number | 0;
  TotalByVendor: Map<string, number>; // Key is Vendor Name
  Invoices: Map<string, Invoice>; // Key is CustomerId
}
