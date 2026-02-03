import { Cell, Column, Workbook, Worksheet } from "exceljs";
import { Task } from "../types";
import { CloudData } from "../backend/CloudData";
import { loadTasks } from "./FillApplicationAccounts";
import { Invoices } from "./Invoices";
import { round2 } from "../backend/Utils";

export class DownloadHelper {
  constructor(
    private initProgress: (text: string) => void,
    private setCurrentProgressText: (text: string) => void,
    private updateProgress: (progress: number) => void,
  ) {}

  private internalDownload = async (workbook: Workbook, fileName: string) => {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);

    const element = document.createElement("a");
    element.href = url;
    element.download = fileName;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    this.updateProgress(2);
  };

  //   private autoWidth = (worksheet: Worksheet, minimalWidth = 10) => {
  //     worksheet.columns.forEach((column: Partial<Column>) => {
  //       let maxColumnLength = 0;
  //       if (column) {
  //       column.eachCell({ includeEmpty: true }, (cell) => {
  //         maxColumnLength = Math.max(maxColumnLength, minimalWidth, cell.value ? cell.value.toString().length : 0);
  //       });
  //       column.width = maxColumnLength + 2;
  //     }
  //     });
  //   };

  private autosizeColumnCells = (worksheet: Worksheet) => {
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

  // Download the Excel file containing input data
  public downloadRawData = async (selectedCloudData: Array<CloudData>, billingMonth: string) => {
    this.initProgress("Loading data...");
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Input Data");

    const tasks: Array<Task> = [];
    let index = 4;
    for (const cloudDataItem of selectedCloudData) {
      this.setCurrentProgressText(`Filling accounts for ${cloudDataItem.CloudVendor.value}...`);
      tasks.push(...(await loadTasks(cloudDataItem)));
      index++;
      this.updateProgress(index / selectedCloudData.length);
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
        { totalsRowLabel: "Product Code", name: "Product Code", filterButton: true },
        { totalsRowLabel: "Cost", name: "Cost", filterButton: true },
        { totalsRowLabel: "Account ID", name: "Account ID", filterButton: true },
        { totalsRowLabel: "Cloud Vendor", name: "Cloud Vendor", filterButton: true },
      ],
      rows,
    });
    this.autosizeColumnCells(worksheet);

    await this.internalDownload(workbook, `${billingMonth}_raw_data.xlsx`);
  };

  // Download the Excel file DBT
  public downloadDBT = async (invoices: Invoices, billingMonth: string) => {
    this.initProgress("Loading data...");
    const workbook = new Workbook();
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
    this.autosizeColumnCells(worksheet);

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
        { totalsRowLabel: "Batch ID", name: "Batch ID", filterButton: true },
        { totalsRowLabel: "Description", name: "Description", filterButton: true },
        { totalsRowLabel: "Amount", name: "Amount", filterButton: true },
        { totalsRowLabel: "Customer", name: "Customer", filterButton: true },
        { totalsRowLabel: "Charge CC", name: "Charge CC", filterButton: true },
        { totalsRowLabel: "Seller", name: "Seller", filterButton: true },
        { totalsRowLabel: "Tenant", name: "Tenant", filterButton: true },
        { totalsRowLabel: "Cloud Account", name: "Cloud Account", filterButton: true },
        { totalsRowLabel: "Cloud Vendor", name: "Cloud Vendor", filterButton: true },
      ],
      rows,
    });

    this.autosizeColumnCells(worksheet2);

    await this.internalDownload(workbook, `${billingMonth}_dbt.xlsx`);
  };
}
