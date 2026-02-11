import { Invoice } from "../frontend/Invoices";

export class InvoiceIDocLine {
  private static getLine = (
    invoice: Invoice,
    system: string,
    company: string,
    companyTo: string,
    type: "Credit" | "Debit",
    costCenter: string,
    vendor: string,
    docType: "SA" | "KR" | "DA",
    index = "01",
  ): Array<string> => {
    return [
      system,
      company,
      companyTo,
      invoice.Date,
      docType,
      `${invoice.ChargebackIdStr}-${index}`,
      invoice.Customer,
      type,
      invoice.SAPAccount,
      costCenter,
      vendor,
      invoice.TotalAmount.toFixed(2),
      "USD",
      // `${invoice.Customer}-${invoice.BillingMonth}, ${invoice.RemitToCode***}`,
      `${invoice.Customer}-${invoice.BillingMonth}, ${invoice.SoldToCode}`,
      "",
    ];
  };

  public static getCreditLine = (
    invoice: Invoice,
    system: string,
    company: string,
    companyTo: string,
    costCenter: string,
    vendor: string,
    docType: "SA" | "KR" | "DA",
    index = "01",
  ): Array<string> => {
    return this.getLine(invoice, system, company, companyTo, "Credit", costCenter, vendor, docType, index);
  };

  public static getDebitLine = (
    invoice: Invoice,
    system: string,
    company: string,
    companyTo: string,
    costCenter: string,
    vendor: string,
    docType: "SA" | "KR" | "DA",
    index = "01",
  ): Array<string> => {
    return this.getLine(invoice, system, company, companyTo, "Debit", costCenter, vendor, docType, index);
  };

  public static getHeader = (): Array<string> => {
    return [
      "System",
      "Company",
      "Company to",
      "Date",
      "Doc Type",
      "Reference",
      "Header Text",
      "Debit/Cred",
      "Account",
      "Cost Center",
      "Vendor/Customer",
      "Amount",
      "Currency",
      "Line Item Text",
      "Busi",
    ];
  };
}
