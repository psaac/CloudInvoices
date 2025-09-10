import { searchWorkItems } from "./jira/search";
import { SETTINGS } from "./consts";
import { getAsset } from "./jira/assets";
import { rgb } from "pdf-lib";
import { attachPdfToIssue } from "./jira/attachments";
import { PDFHelper, PDFElementType, DEFAULT_PDF_SETTINGS, CellElement, HeaderAndCells } from "./pdfhelper";
import { VANTIVA_LOGO } from "./img/vantivaLogo";
import { getWorkItems } from "./jira/workItem";
import { transition } from "./jira/transition";
import { APIResponse } from "@forge/api";
// import { log } from "./logger";

export interface ChargebackIn {
  key: string;
  link: string;
  summary: string;
  status: string;
  appAccountId: string;
  appAccountAsset: any;
  appAccountName: string;
  cbAccountName: string;
  issueLinks: any[];
  cost: number;
  billingMonth: string;
}

interface ChargebackInListQuery {
  billingMonth: string;
  issueType: string;
  status: string;
  baseUrl: string;
}

export const CHARGEBACKIN_FIELDS = [
  "summary",
  "status",
  SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountAsset,
  SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountId,
  SETTINGS.CUSTOMFIELDS_IDS.Cost,
  SETTINGS.CUSTOMFIELDS_IDS.BillingMonth,
  "issuelinks",
];

export const CHARGEBACKOUT_FIELDS = [
  "summary",
  "status",
  SETTINGS.CUSTOMFIELDS_IDS.ChargebackAccountAsset,
  SETTINGS.CUSTOMFIELDS_IDS.Cost,
  SETTINGS.CUSTOMFIELDS_IDS.BillingMonth,
  "issuelinks",
];

const loadChargebackIn = async (workItem: any, baseUrl: string): Promise<ChargebackIn> => {
  const appAccountAsset = workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountAsset];
  let appAccountName = "";
  let cbAccountName = "";
  let asset: any;
  if (appAccountAsset && appAccountAsset.length > 0) {
    asset = await getAsset({
      assetId: appAccountAsset[0].objectId,
    });
    if (asset) {
      appAccountName = asset.name;
      const attribute = asset.attributes.find((attr: any) => attr.id === SETTINGS.CHARGEBACK_ACCOUNT_ASSET_ID);
      cbAccountName = attribute?.objectAttributeValues?.[0]?.displayValue;
    }
  }

  return {
    key: workItem.key,
    link: `${baseUrl}/browse/${workItem.key}`,
    summary: workItem.fields.summary,
    status: workItem.fields.status.name,
    appAccountId: workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.ApplicationAccountId],
    appAccountAsset: asset,
    appAccountName: appAccountName,
    cbAccountName: cbAccountName,
    issueLinks: workItem.fields.issuelinks,
    cost: workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost],
    billingMonth: workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.BillingMonth],
  };
};

const getChargebackInList = async ({
  billingMonth,
  issueType,
  status,
  baseUrl = "",
}: ChargebackInListQuery): Promise<ChargebackIn[]> => {
  const chargebackInList = await searchWorkItems({
    jql: `project = ${SETTINGS.PROJECT_KEY} AND \"Billing Month\" ~ ${billingMonth} AND issueType = "${issueType}" AND status = "${status}" ORDER BY created DESC`,
    fields: CHARGEBACKIN_FIELDS,
  });

  // log(`ChargebackInList with status ${status}:`, chargebackInList);

  return await Promise.all(
    (chargebackInList || []).map(async (workItem: any) => {
      return loadChargebackIn(workItem, baseUrl);
    })
  );
};

const loadChargebackOut = async (workItem: any, baseUrl: string): Promise<ChargebackIn> => {
  const cbAccountAsset = workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.ChargebackAccountAsset];
  let cbAccountName = "";
  let asset: any;
  if (cbAccountAsset && cbAccountAsset.length > 0) {
    asset = await getAsset({
      assetId: cbAccountAsset[0].objectId,
    });
    cbAccountName = asset ? asset.name : "";
  }

  return {
    key: workItem.key,
    link: `${baseUrl}/browse/${workItem.key}`,
    summary: workItem.fields.summary,
    status: workItem.fields.status.name,
    appAccountId: "",
    appAccountAsset: null,
    appAccountName: "",
    cbAccountName: cbAccountName,
    issueLinks: workItem.fields.issuelinks,
    cost: workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost],
    billingMonth: workItem.fields[SETTINGS.CUSTOMFIELDS_IDS.BillingMonth],
  };
};

const getChargebackOutList = async ({
  billingMonth,
  status,
  baseUrl = "",
}: ChargebackInListQuery): Promise<ChargebackIn[]> => {
  const chargebackInList = await searchWorkItems({
    jql: `project = ${SETTINGS.PROJECT_KEY} AND status = ${status} AND issueType = ${SETTINGS.CHARGEBACKOUT_WORKTYPE_NAME} AND \"Billing Month\" ~ ${billingMonth}`,
    fields: CHARGEBACKOUT_FIELDS,
  });

  return await Promise.all(
    (chargebackInList || []).map(async (workItem: any) => {
      return loadChargebackOut(workItem, baseUrl);
    })
  );
};

const generateChargebackNumber = (lastChargebackOutList: any[]) => {
  let nextId = "CHGB0010000";
  if (lastChargebackOutList.length > 0) {
    const match = lastChargebackOutList[0].fields.summary.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      const prefix = match[1]; // "CHGB"
      const number = parseInt(match[2], 10) + 1; // 18709
      const padded = number.toString().padStart(match[2].length, "0"); // "00018709"
      nextId = prefix + padded;
    }
  }
  return nextId;
};

const hasLink = (chargebackIn: ChargebackIn, linkName: string): boolean => {
  return chargebackIn.issueLinks?.some((link: any) => link.type.name === linkName) || false;
};

const generateInvoice = async (workItem: ChargebackIn): Promise<APIResponse> => {
  const currencyFormat = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }); //.format(workItem.cost);

  const pdfSettings = DEFAULT_PDF_SETTINGS;
  pdfSettings.headerHeight = 40;
  const pdfHelper = await PDFHelper.create(pdfSettings);

  const BLUE = rgb(0.28, 0.33, 0.55);
  // Header / Footer
  const headerLabelsX = 400;
  const headerValuesX = 450;
  const headerLabelValue1Y = 760;
  const headerLabelValue2Y = 750;
  const headerLabelValue3Y = 740;
  const headerLabelValueSize = 8;
  pdfHelper.setStaticElements([
    // Header
    { type: PDFElementType.IMAGE, placeholder: VANTIVA_LOGO, point: { y: 730 }, aspectRatio: 0.25 },
    { type: PDFElementType.TEXT, placeholder: `PROJECT E-INVOICE`, size: 12, point: { x: 170, y: 745 } },
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
      placeholder: `CHGB00010000`,
      size: headerLabelValueSize,
      point: { x: headerValuesX, y: headerLabelValue1Y },
    },
    {
      type: PDFElementType.TEXT,
      placeholder: `${new Date().toLocaleDateString("fr-CA")}`,
      size: headerLabelValueSize,
      point: { x: headerValuesX, y: headerLabelValue2Y },
    },
    {
      type: PDFElementType.TEXT,
      placeholder: `2025-05`,
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
    width: 240,
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
        text: `\nCLE3211 - Vantiva USA Shared Services Inc\n4855 Peachtree Industrial Boulevard Suite\n200 Norcross, GA 3\nUnited States of America\nSCS dedicated during TSA\n2013236MA4\nGuilhem Maraval\nMARWAN KENZOU`,
        point: { x: 70, y: 15 },
      },
    ],
  });

  pdfHelper.drawRectangleAndText({
    point: { x: 270, y: 560 },
    width: 240,
    height: 100,
    borderColor: BLUE,
    textSize: 8,
    textElements: [
      {
        text: `REMIT TO\nCustomer:\nAddress:`,
        point: { x: 5, y: 15 },
        bold: true,
      },
      {
        text: `\nE3211 - Vantiva USA Shared Services Inc.\n4855 Peachtree Industrial Boulevard Suite\n200 Norcross, GA 3\nUnited States of America`,
        point: { x: 70, y: 15 },
      },
    ],
  });

  let linesDataItems = new Map<string, HeaderAndCells[]>();

  // Get group data
  let groupDataItems: HeaderAndCells[] = [
    { header: { text: "Vendor", x: 5, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
    { header: { text: "Total Amt", x: 300, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
    { header: { text: "Currency", x: 400, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
  ];

  const linkedWorkItemKeys = workItem.issueLinks
    .filter((link) => link.type.name === SETTINGS.CHARGEBACK_GROUP_LINK_NAME && link.outwardIssue)
    .map((link) => link.outwardIssue.key);

  const linkedWorkItems = await getWorkItems({
    issueIdsOrKeys: linkedWorkItemKeys,
    fields: ["summary", SETTINGS.CUSTOMFIELDS_IDS.Cost],
  });
  const linkedWorkItemsSorted = linkedWorkItems.sort((a, b) =>
    (a.fields.summary || "").localeCompare(b.fields.summary || "")
  );

  for (const linkedWorkItem of linkedWorkItemsSorted) {
    if (linkedWorkItem.fields) {
      const summary: string = linkedWorkItem.fields.summary || "";
      if (groupDataItems[0]) groupDataItems[0].colItems.push({ text: `${summary.substring(14)}` });
      if (groupDataItems[1])
        groupDataItems[1].colItems.push({
          text: `${currencyFormat.format(linkedWorkItem.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost] ?? 0)}`,
        });
      if (groupDataItems[2]) groupDataItems[2].colItems.push({ text: `USD` });

      // Get lines of group
      const workItemData: HeaderAndCells[] = [
        {
          header: { text: `${linkedWorkItem.fields.summary || ""}`, x: 5, color: rgb(1, 1, 1) },
          colItems: [] as CellElement[],
        },
        { header: { text: `Charges`, x: 310, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
        { header: { text: `Discount`, x: 360, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
        { header: { text: `Total`, x: 410, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
        { header: { text: `Currency`, x: 460, color: rgb(1, 1, 1) }, colItems: [] as CellElement[] },
      ];

      const lines = await searchWorkItems({
        jql: `project = ${SETTINGS.PROJECT_KEY} and issuetype = ChargebackLineOut and key in linkedIssues("${
          linkedWorkItem.key
        }") and ${SETTINGS.CUSTOMFIELDS_IDS.DebitCredit.replace("customfield_", "cf[")}] = Debit`,
        fields: ["summary", SETTINGS.CUSTOMFIELDS_IDS.Cost],
      });

      for (const line of lines) {
        if (workItemData[0]) workItemData[0].colItems.push({ text: `${line.fields.summary || ""}` });
        if (workItemData[1])
          workItemData[1].colItems.push({
            text: `${currencyFormat.format(line.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost] ?? 0)}`,
          });
        if (workItemData[2]) workItemData[2].colItems.push({ text: `${currencyFormat.format(0)}` });
        if (workItemData[3])
          workItemData[3].colItems.push({
            text: `${currencyFormat.format(line.fields[SETTINGS.CUSTOMFIELDS_IDS.Cost] ?? 0)}`,
          });
        if (workItemData[4]) workItemData[4].colItems.push({ text: `USD` });
      }

      linesDataItems.set(linkedWorkItem.fields.summary, workItemData);
    }
  }

  // Total
  if (groupDataItems[0]) groupDataItems[0].colItems.push({ text: `TOTAL`, bold: true });
  if (groupDataItems[1])
    groupDataItems[1].colItems.push({ text: `${currencyFormat.format(workItem.cost ?? 0)}`, bold: true });
  if (groupDataItems[2]) groupDataItems[2].colItems.push({ text: `USD`, bold: true });

  // Draw table containing summary
  pdfHelper.drawTable({
    title: { text: "Summary of Project eInvoice", size: 18, bold: true },
    y: 520,
    headerBgColor: BLUE,
    textSize: 9,
    items: groupDataItems,
  });

  // Invoice lines
  let firstGroup = true;
  for (const [_, linesData] of linesDataItems) {
    pdfHelper.drawTable({
      title: firstGroup ? { text: "Details of Project Expenses", size: 18, bold: true } : { text: "" },
      headerBgColor: BLUE,
      textSize: 8,
      items: linesData,
    });
    firstGroup = false;
  }

  await attachPdfToIssue(await pdfHelper.save(), workItem.key);

  return await transition({ workItemKey: workItem.key, status: "Closed" });
};

export {
  generateChargebackNumber,
  hasLink,
  getChargebackInList,
  loadChargebackIn,
  getChargebackOutList,
  generateInvoice,
};
