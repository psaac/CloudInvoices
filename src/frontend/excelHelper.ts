import { Cell, Column, Workbook, Worksheet } from "exceljs";
import { CloudData } from "../backend/CloudData";
import { Task } from "../types";
import { loadTasks } from "./FillApplicationAccounts";
import { Invoices } from "./Invoices";
import { round2 } from "../backend/Utils";

export class ExcelHelper {
  private static autosizeColumnCells = (worksheet: Worksheet) => {
    let dataMax: number[];
    let max: number;
    worksheet.columns.forEach((column: Partial<Column>) => {
      dataMax = [];
      if (column && column.eachCell) {
        column.eachCell({ includeEmpty: false }, (cell: Cell) => {
          dataMax.push(cell.value?.toString().length || 0);
        });
        max = Math.max(...dataMax);
        column.width = max < 10 ? 10 : max;
      }
    });
  };

  public static generateRawData = async (selectedCloudData: Array<CloudData>, workbook: Workbook) => {
    const worksheet = workbook.addWorksheet("Input Data");

    const tasks: Array<Task> = [];
    for (const cloudDataItem of selectedCloudData) {
      tasks.push(...(await loadTasks(cloudDataItem)));
    }

    const rows: Array<Array<any>> = [];
    tasks.forEach((task) => {
      rows.push([task.u_product_code, task.u_cost, task.u_account_id, task.CloudVendor]);
    });
    worksheet.addTable({
      name: "InputData",
      ref: "A1",
      headerRow: true,
      style: {
        theme: "TableStyleMedium5",
        showRowStripes: true,
      },
      columns: [
        { name: "Product Code", filterButton: true },
        { name: "Cost", filterButton: true },
        { name: "Account ID", filterButton: true },
        { name: "Cloud Vendor", filterButton: true },
      ],
      rows,
    });
    ExcelHelper.autosizeColumnCells(worksheet);
  };

  public static generateDBT = async (invoices: Invoices, workbook: Workbook) => {
    const worksheet = workbook.addWorksheet("Summary");
    worksheet.columns = [
      { header: "Row Labels", key: "vendor" },
      { header: "Sum of Amount", key: "amount" },
    ];

    invoices.TotalByVendor.forEach((amount, vendor) => {
      worksheet.addRow({ vendor, amount: round2(amount) });
    });
    worksheet.addRow({ vendor: "Network Shared Costs", amount: round2(invoices.NetworkSharedCosts) });
    worksheet.addRow({ vendor: "Security Shared Costs", amount: round2(invoices.SecuritySharedCosts) });
    worksheet.addRow({ vendor: "Grand Total", amount: round2(invoices.GrandTotal) });
    ExcelHelper.autosizeColumnCells(worksheet);

    const worksheet2 = workbook.addWorksheet("DBT");
    const rows: Array<Array<any>> = [];
    invoices.Invoices.forEach((invoice) => {
      invoice.CostsByVendor.forEach((vendorCost) => {
        vendorCost.CostsByAppAccount.forEach((appAccountCost) => {
          appAccountCost.Tasks.forEach((task) => {
            rows.push([
              `${invoices.BillingMonth}-${task.BatchId}`,
              task.u_product_code,
              task.u_cost,
              invoice.Customer,
              invoice.CostCenter,
              task.Seller,
              invoice.Tenant,
              task.u_account_id,
              task.CloudVendor,
            ]);
          });
        });
      });
    });

    worksheet2.addTable({
      name: "DBT",
      ref: "A1",
      headerRow: true,
      style: {
        theme: "TableStyleMedium2",
        showRowStripes: true,
      },
      columns: [
        { name: "Batch ID", filterButton: true },
        { name: "Description", filterButton: true },
        { name: "Amount", filterButton: true },
        { name: "Customer", filterButton: true },
        { name: "Charge CC", filterButton: true },
        { name: "Seller", filterButton: true },
        { name: "Tenant", filterButton: true },
        { name: "Cloud Account", filterButton: true },
        { name: "Cloud Vendor", filterButton: true },
      ],
      rows,
    });

    ExcelHelper.autosizeColumnCells(worksheet2);
  };

  public static generateEINV = async (invoices: Invoices, workbook: Workbook) => {
    const worksheet = workbook.addWorksheet("E_INV");

    const rows: Array<Array<any>> = [];
    invoices.Invoices.forEach((invoice) => {
      rows.push([
        invoice.Customer,
        invoice.Owner,
        round2(invoice.TotalAmount),
        invoice.BillingMonth,
        invoice.ChargebackIdStr,
        invoice.CostCenter,
        `CL${invoice.SoldToCode}`,
        invoice.Controller,
        invoice.Tenant,
        invoice.LegalEntityCode,
        `${invoice.Customer}-${invoice.BillingMonth}`,
      ]);
    });

    worksheet.addTable({
      name: "E_INV",
      ref: "A1",
      headerRow: true,
      style: {
        theme: "TableStyleMedium3",
        showRowStripes: true,
      },
      columns: [
        { name: "Project", filterButton: true },
        { name: "Administrator", filterButton: true },
        { name: "Total", filterButton: true },
        { name: "Billing Period", filterButton: true },
        { name: "ChargeBack Id", filterButton: true },
        { name: "Customer CC", filterButton: true },
        { name: "Customer", filterButton: true },
        { name: "Controller", filterButton: true },
        { name: "Tenant", filterButton: true },
        { name: "Charge LE", filterButton: true },
        { name: "eInvoice Name", filterButton: true },
      ],
      rows,
    });

    // Set total column format to currency
    worksheet.getColumn("C").numFmt = "[$$-1009]#,##0.00";

    ExcelHelper.autosizeColumnCells(worksheet);
  };
}
