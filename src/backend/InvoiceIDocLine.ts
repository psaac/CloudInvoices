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
      `${invoice.Customer}-${invoice.BillingMonth}, ${invoice.RemitToCode}`,
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

  // public static getSystemAndCompany = (code: string) => {
  //   const match = code.match(/\(\w{3,}\)$/);
  //   const system = (match?.[0] ?? "").slice(1, -1) ?? "000";
  //   const match2 = code.match(/^\w+\s\(/);
  //   const company = match2?.[0]?.trim().slice(0, -2) ?? "";
  //   return { system, company };
  // };
}
