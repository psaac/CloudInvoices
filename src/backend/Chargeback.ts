import { Settings } from "../types";
import { searchWorkItems } from "./jira/search";
import { createWorkItem, deleteWorkItem } from "./jira/WorkItem";
import { Fields } from "./Fields";
import { attachToIssue } from "./jira/attachments";
import { Invoice } from "../frontend/Invoices";
import { getChargebackIdStr, InvoiceLine } from "./InvoiceLine";
import { CellElement, DEFAULT_PDF_SETTINGS, HeaderAndCells, PDFElementType, PDFHelper } from "../backend/Pdfhelper";
import { rgb } from "pdf-lib";
import { VANTIVA_LOGO } from "../backend/img/vantivaLogo";
import { InvoiceIDocLine } from "./InvoiceIDocLine";

export class Chargeback {
  public static getInvoiceLinesByBillingMonth = async (
    billingMonth: string,
    settings: Settings,
    baseUrl: string
  ): Promise<Array<InvoiceLine>> => {
    const result: Array<InvoiceLine> = [];

    // Search for existing invoice sub-tasks
    const existingItems = await searchWorkItems({
      jql: `project = ${settings.spaceId} AND cf[${Fields.fieldId(
        settings.inputFieldBillingMonth
      )}] ~ ${billingMonth} AND issueType = ${settings.targetWorkTypeId}`,
      fields: ["summary", "sub-tasks"],
    });

    // Should be only one here
    for (const item of existingItems) {
      result.push({
        ChargebackIdStr: "-",
        Summary: item.fields.summary || "",
        Key: item.key,
        Link: `${baseUrl}/browse/${item.key}`,
      });

      const existingSubItems = await searchWorkItems({
        jql: `project = ${settings.spaceId} AND parent = ${item.key}`,
        fields: ["summary", settings.inputFieldChargebackId],
      });
      for (const subItem of existingSubItems) {
        result.push({
          ChargebackIdStr: getChargebackIdStr(settings.invoicePrefix, subItem.fields[settings.inputFieldChargebackId]),
          Summary: subItem.fields.summary || "",
          Key: subItem.key,
          Link: `${baseUrl}/browse/${subItem.key}`,
        });
      }
    }

    return result;
  };

  public static createChargebackItem = async ({
    settings,
    summary,
    billingMonth,
  }: {
    settings: Settings;
    summary: string;
    billingMonth: string;
  }): Promise<{
    key: string;
    lastChargebackNumber: number;
  }> => {
    const result: {
      key: string;
      lastChargebackNumber: number;
    } = { key: "", lastChargebackNumber: 0 };

    // If work item already exists, return it (with subTasks & attachments)
    const jql = `project = ${settings.spaceId} AND cf[${Fields.fieldId(
      settings.inputFieldBillingMonth
    )}] ~ ${billingMonth} AND issueType = ${settings.targetWorkTypeId}`;
    const existingItems = await searchWorkItems({ jql });
    for (const item of existingItems) {
      await deleteWorkItem({ workItemKey: item.key });
    }
    // Create JIRA Work item to store Invoices (as sub-tasks) & ID Files
    const response = await createWorkItem({
      issueTypeId: settings.targetWorkTypeId,
      summary,
      spaceId: settings.spaceId,
      fields: {
        [settings.inputFieldBillingMonth]: billingMonth,
      },
    });
    result.key = response.key;

    // Get last chargeback number
    const existingInvoiceItems = await searchWorkItems({
      jql: `project = ${settings.spaceId} AND cf[${Fields.fieldId(
        settings.inputFieldChargebackId
      )}] IS NOT EMPTY AND issueType = ${settings.invoiceWorkTypeId} ORDER BY cf[${Fields.fieldId(
        settings.inputFieldChargebackId
      )}] DESC`,
      fields: [settings.inputFieldChargebackId],
      maxResults: 1,
    });
    if (existingInvoiceItems && existingInvoiceItems.length > 0) {
      result.lastChargebackNumber = parseInt(existingInvoiceItems[0].fields[settings.inputFieldChargebackId]);
    }

    return result;
  };

  public static createInvoiceSubItem = async ({
    settings,
    parentWorkItemKey,
    summary,
    invoice,
  }: {
    settings: Settings;
    parentWorkItemKey: string;
    summary: string;
    invoice: Invoice;
  }): Promise<string> => {
    // Create JIRA Work item to store Invoice (as sub-task)
    const response = await createWorkItem({
      issueTypeId: settings.invoiceWorkTypeId,
      summary,
      spaceId: settings.spaceId,
      fields: {
        parent: {
          key: parentWorkItemKey,
        },
        [settings.inputFieldChargebackId]: invoice.ChargebackId ?? "0",
      },
    });
    const subTaskKey = response.key;

    // Generate PDF
    const currencyFormat = new Intl.NumberFormat("en-CA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }); //.format(workItem.cost);

    const pdfSettings = DEFAULT_PDF_SETTINGS;
    pdfSettings.headerHeight = 40;
    const BLUE = rgb(0.28, 0.33, 0.55);

    const pdfHelper = await PDFHelper.create(pdfSettings);

    // Header / Footer
    const headerLabelsX = 400;
    const headerValuesX = 450;
    const headerLabelValue1Y = 760;
    const headerLabelValue2Y = 750;
    const headerLabelValue3Y = 740;
    const headerLabelValueSize = 8;

    pdfHelper.setStaticElements([
      // Header
      {
        type: PDFElementType.IMAGE,
        placeholder: VANTIVA_LOGO,
        point: { y: 730 },
        aspectRatio: 0.25,
      },
      {
        type: PDFElementType.TEXT,
        placeholder: `PROJECT E-INVOICE`,
        size: 12,
        point: { x: 170, y: 745 },
      },
      {
        type: PDFElementType.TEXT,
        placeholder: `Number:`,
        size: headerLabelValueSize,
        point: { x: headerLabelsX, y: headerLabelValue1Y },
        bold: true,
      },
      {
        type: PDFElementType.TEXT,
        placeholder: `Date:`,
        size: headerLabelValueSize,
        point: { x: headerLabelsX, y: headerLabelValue2Y },
        bold: true,
      },
      {
        type: PDFElementType.TEXT,
        placeholder: `Bill Period:`,
        size: headerLabelValueSize,
        point: { x: headerLabelsX, y: headerLabelValue3Y },
        bold: true,
      },

      {
        type: PDFElementType.TEXT,
        placeholder: `${invoice.ChargebackIdStr ?? "UNDEFINED"}`,
        size: headerLabelValueSize,
        point: { x: headerValuesX, y: headerLabelValue1Y },
      },
      {
        type: PDFElementType.TEXT,
        placeholder: invoice.Date,
        size: headerLabelValueSize,
        point: { x: headerValuesX, y: headerLabelValue2Y },
      },
      {
        type: PDFElementType.TEXT,
        placeholder: invoice.BillingMonth,
        size: headerLabelValueSize,
        point: { x: headerValuesX, y: headerLabelValue3Y },
      },
      // Footer
      {
        type: PDFElementType.TEXT,
        placeholder: `For questions, please open a ticket or contact your Cloud Administrator. `,
        size: 9,
        point: { y: 20 },
      },
      {
        type: PDFElementType.PAGE,
        size: 9,
        point: { x: 460, y: 20 },
      },
    ]);

    // Sold To / Remit To
    pdfHelper.drawRectangleAndText({
      point: { x: 0, y: 560 },
      width: 250,
      height: 100,
      borderColor: BLUE,
      textSize: 8,
      textElements: [
        {
          text: `SOLD TO\nCustomer:\nAddress:\n\n\nProject:\nCost Center:\nOwner:\nController:`,
          point: { x: 5, y: 15 },
          bold: true,
        },
        {
          text: `\nCL${invoice.ReportingUnit} - Vantiva USA Shared Services Inc\n4855 Peachtree Industrial Boulevard Suite 200 Norcross,\nGA 30092 United States of America\n${invoice.Customer}\n${invoice.CostCenter}\n${invoice.Owner}\n${invoice.Controller}`,
          point: { x: 55, y: 15 },
        },
      ],
    });

    pdfHelper.drawRectangleAndText({
      point: { x: 260, y: 560 },
      width: 250,
      height: 100,
      borderColor: BLUE,
      textSize: 8,
      textElements: [
        {
          text: `REMIT\nTO\nCustomer:\nAddress:`,
          point: { x: 5, y: 15 },
          bold: true,
        },
        {
          text: `\n\nE3211 - Vantiva USA Shared Services Inc.\n4855 Peachtree Industrial Boulevard Suite 200 Norcross,\nGA 30092 United States\ndd38b7111b121100763d91eebc0713f5`,
          point: { x: 55, y: 15 },
        },
      ],
    });

    let linesDataItems = new Map<string, HeaderAndCells[]>();

    // Get group data
    const groupDataItems: HeaderAndCells[] = [
      { header: { text: "Vendor", x: 5, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
      {
        header: { text: "Total Amt", x: 300, color: rgb(1, 1, 1) },
        colItems: [] as CellElement[],
      },
      {
        header: { text: "Currency", x: 400, color: rgb(1, 1, 1) },
        colItems: [] as CellElement[],
      },
    ];

    for (const [vendorName, vendorCost] of Array.from(invoice.CostsByVendor.entries()).sort()) {
      // Total
      groupDataItems[0]?.colItems.push({ text: vendorName });
      groupDataItems[1]?.colItems.push({
        text: `${currencyFormat.format(vendorCost.TotalAmount)}`,
      });
      groupDataItems[2]?.colItems.push({ text: `USD` });

      // Detail
      const workItemData: HeaderAndCells[] = [
        {
          header: { text: vendorName, x: 5, color: rgb(1, 1, 1) },
          colItems: [] as CellElement[],
        },
        {
          header: { text: `Charges`, x: 310, color: rgb(1, 1, 1) },
          colItems: [] as CellElement[],
        },
        {
          header: { text: `Discount`, x: 360, color: rgb(1, 1, 1) },
          colItems: [] as CellElement[],
        },
        {
          header: { text: `Total`, x: 410, color: rgb(1, 1, 1) },
          colItems: [] as CellElement[],
        },
        {
          header: { text: `Currency`, x: 460, color: rgb(1, 1, 1) },
          colItems: [] as CellElement[],
        },
      ];

      for (const [appId, appCost] of Array.from(vendorCost.CostsByAppAccount.entries()).sort()) {
        for (const task of appCost.Tasks) {
          workItemData[0]?.colItems.push({ text: `${appId} ${task.Summary}` });
          workItemData[1]?.colItems.push({
            text: `${currencyFormat.format(task.Cost)}`,
          });

          workItemData[2]?.colItems.push({ text: `${currencyFormat.format(0)}` });

          workItemData[3]?.colItems.push({
            text: `${currencyFormat.format(task.Cost)}`,
          });
          workItemData[4]?.colItems.push({ text: `USD` });
        }
      }

      linesDataItems.set(vendorName, workItemData);
    }
    // Grand Total
    groupDataItems[0]?.colItems.push({ text: `TOTAL`, bold: true });
    groupDataItems[1]?.colItems.push({
      text: `${currencyFormat.format(invoice.TotalAmount ?? 0)}`,
      bold: true,
    });
    groupDataItems[2]?.colItems.push({ text: `USD`, bold: true });

    // Draw table containing summary
    pdfHelper.drawTable({
      title: { text: "Summary of Project eInvoice", size: 18, bold: true },
      y: 520,
      headerBgColor: BLUE,
      textSize: 9,
      items: groupDataItems,
      headerSize: 9,
    });

    // Invoice lines
    let firstGroup = true;
    for (const [_, linesData] of linesDataItems) {
      pdfHelper.drawTable({
        title: firstGroup ? { text: "Details of Project Expenses", size: 18, bold: true } : { text: "" },
        headerBgColor: BLUE,
        textSize: 6.5,
        items: linesData,
        headerSize: 10,
      });
      firstGroup = false;
    }

    const pdf = await pdfHelper.save();

    await attachToIssue({
      fileContent: pdf,
      workItemKey: subTaskKey,
      fileName: `${invoice.ChargebackIdStr}.pdf`,
    });

    // Generate IDocs files
    // Always generate 01 file with defaultChargeLE
    const directBill = invoice.ChargeLE === settings.defaultChargeLE;
    const infos01 = InvoiceIDocLine.getSystemAndCompany(settings.defaultChargeLE);
    const iDoc01Lines = [
      InvoiceIDocLine.getHeader(),
      InvoiceIDocLine.getCreditLine(
        invoice,
        infos01.system,
        infos01.company,
        invoice.ChargeLE,
        settings.defaultCostCenter,
        ""
      ),
      InvoiceIDocLine.getDebitLine(
        invoice,
        infos01.system,
        infos01.company,
        invoice.ChargeLE,
        directBill ? invoice.CostCenter : "",
        !directBill ? `CL${invoice.ReportingUnit}` : ""
      ),
    ];
    const text01 = iDoc01Lines.map((line) => line.join("\t")).join("\n");
    // console.log(`IDoc 01 Lines for Invoice ${invoice.CustomerId}:\n`, text01);
    const uint8Array01 = new TextEncoder().encode(text01);
    await attachToIssue({
      fileContent: uint8Array01,
      workItemKey: parentWorkItemKey,
      fileName: `${invoice.ChargebackIdStr}-01.txt`,
    });

    if (!directBill) {
      const infos02 = InvoiceIDocLine.getSystemAndCompany(invoice.ChargeLE);
      const iDoc02Lines = [
        InvoiceIDocLine.getHeader(),
        InvoiceIDocLine.getCreditLine(
          invoice,
          infos02.system,
          infos02.company,
          settings.defaultChargeLE,
          "",
          settings.defaultVendor,
          "02"
        ),
        InvoiceIDocLine.getDebitLine(
          invoice,
          infos02.system,
          infos02.company,
          settings.defaultChargeLE,
          invoice.CostCenter,
          "",
          "02"
        ),
      ];
      const text02 = iDoc02Lines.map((line) => line.join("\t")).join("\n");
      // console.log(`IDoc 02 Lines for Invoice ${invoice.CustomerId}:\n`, text02);
      const uint8Array02 = new TextEncoder().encode(text02);
      await attachToIssue({
        fileContent: uint8Array02,
        workItemKey: parentWorkItemKey,
        fileName: `${invoice.ChargebackIdStr}-02.txt`,
      });
    }
    return subTaskKey;
  };
}
