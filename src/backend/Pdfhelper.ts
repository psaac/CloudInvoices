import { PDFDocument, StandardFonts, PDFFont, Color, PDFPage, rgb, PageSizes } from "pdf-lib";

export const DEFAULT_PDF_SETTINGS = {
  leftMargin: 50,
  topMargin: 50,
  headerHeight: 0,
};

export enum PDFElementType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  PAGE = "PAGE",
}

interface Point {
  x?: number;
  y: number;
}

interface PDFElement {
  type: PDFElementType;
  placeholder?: string;
  point: Point;
  size?: number;
  color?: Color;
  aspectRatio?: number;
  bold?: boolean;
}

interface PDFSettings {
  leftMargin: number;
  topMargin: number;
  headerHeight: number;
}

export interface CellElement {
  text: string;
  color?: Color;
  bold?: boolean;
}

export interface HeaderElement extends CellElement {
  x: number;
}

export interface HeaderAndCells {
  header: HeaderElement;
  colItems: CellElement[];
}

export interface TextElement extends CellElement {
  point: Point;
}

export interface SizedTextElement extends CellElement {
  size?: number;
}

class PDFHelper {
  pdfDoc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  pages: PDFPage[];
  currentYpos: number;
  staticElements: PDFElement[];
  settings: PDFSettings;

  private constructor(pdfDoc: PDFDocument, font: PDFFont, fontBold: PDFFont, settings: PDFSettings) {
    this.pdfDoc = pdfDoc;
    this.font = font;
    this.fontBold = fontBold;
    this.pages = [];
    this.currentYpos = 0;
    this.staticElements = [];
    this.settings = settings;
  }

  static async create(
    settings: PDFSettings = DEFAULT_PDF_SETTINGS,
    font: StandardFonts = StandardFonts.Helvetica,
    fontBold: StandardFonts = StandardFonts.HelveticaBold
  ): Promise<PDFHelper> {
    const pdfDoc = await PDFDocument.create();
    const embedFont = await pdfDoc.embedFont(font);
    const embedFontBold = await pdfDoc.embedFont(fontBold);
    return new PDFHelper(pdfDoc, embedFont, embedFontBold, settings);
  }

  private currentPage(): PDFPage {
    if (this.pages.length === 0 || this.currentYPosIsPageBreak()) {
      // console.log("Adding new page", this.currentYpos);
      this.currentYpos = PageSizes.Letter[1] - this.settings.topMargin - this.settings.headerHeight;
      this.pages.push(this.pdfDoc.addPage(PageSizes.Letter));
    }
    const page = this.pages[this.pages.length - 1];
    if (!page) {
      throw new Error("No PDF page available.");
    }
    return page;
  }

  private internalDrawTextOnPage(
    page: PDFPage,
    text: string,
    color: Color,
    size: number,
    point: Point,
    bold: boolean = false,
    lineHeight: number = 0
  ): void {
    page.drawText(text, {
      x: point.x ?? 0,
      y: point.y,
      size: size,
      font: bold ? this.fontBold : this.font,
      color: color,
      lineHeight: lineHeight === 0 ? size * 1.2 : lineHeight,
    });
  }

  private currentYPosIsPageBreak(): boolean {
    return this.currentYpos < this.settings.topMargin;
  }

  // Returns true if pagebreak occurs after drawing the text
  private internalDrawText(
    text: string,
    color: Color,
    size: number,
    xOffset: number = 0,
    bold: boolean = false,
    keepYPos: boolean = false
  ): boolean {
    this.internalDrawTextOnPage(
      this.currentPage(),
      text,
      color,
      size,
      {
        x: this.settings.leftMargin + xOffset,
        y: this.currentYpos,
      },
      bold
    );
    if (!keepYPos) this.currentYpos -= size * 1.6;
    return this.currentYPosIsPageBreak();
  }

  public drawH1({ text, color = rgb(0, 0, 0), bold = false }: { text: string; color?: Color; bold?: boolean }): void {
    this.internalDrawText(text, color, 18, 0, bold);
  }

  public drawText({
    text,
    color = rgb(0, 0, 0),
    size = 12,
    xOffset = 0,
    bold = false,
    keepYPos = false,
  }: {
    text: string;
    color?: Color;
    size?: number;
    xOffset?: number;
    bold?: boolean;
    keepYPos?: boolean;
  }): void {
    this.internalDrawText(text, color, size, xOffset, bold, keepYPos);
  }

  public drawRectangleAndText({
    point,
    width,
    height,
    borderColor = rgb(0, 0, 0),
    borderOpacity = 1,
    bgColor = rgb(1, 1, 1),
    bgOpacity = 1,
    textSize,
    textElements,
  }: {
    point: Point;
    width: number;
    height: number;
    borderColor?: Color;
    borderOpacity?: number;
    bgColor?: Color;
    bgOpacity?: number;
    textSize: number;
    textElements: TextElement[];
  }): void {
    const page = this.currentPage();
    page.moveTo(0, 0);
    if (height > 0)
      page.drawRectangle({
        x: this.settings.leftMargin + (point.x ?? 0),
        y: point.y,
        width: width === 0 ? PageSizes.Letter[0] - 2 * this.settings.leftMargin : width,
        height: height,
        borderWidth: 1,
        borderColor: borderColor,
        borderOpacity: borderOpacity,
        color: bgColor,
        opacity: bgOpacity,
      });

    for (const textElement of textElements) {
      page.moveTo(0, 0);
      this.internalDrawTextOnPage(
        page,
        textElement.text,
        textElement.color ?? rgb(0, 0, 0),
        textSize,
        {
          x: this.settings.leftMargin + (point.x ?? 0) + (textElement.point.x ?? 0),
          y: point.y - textElement.point.y + height,
        },
        textElement.bold
      );
    }
  }

  public drawTable({
    title = { text: "", size: 18, bold: false, color: rgb(0, 0, 0) },
    width = 0,
    headerBgColor = rgb(0.5, 0.5, 0.5),
    textSize = 12,
    items,
    y = this.currentYpos,
    headerSize = 12,
  }: {
    title?: SizedTextElement;
    width?: number;
    headerBgColor?: Color;
    textSize?: number;
    items: HeaderAndCells[];
    y?: number;
    headerSize?: number;
  }): void {
    this.goto(y);

    let point = { x: 0, y: this.currentYpos };

    if (title !== undefined && title.text !== "")
      this.internalDrawText(title.text, title.color ?? rgb(0, 0, 0), title.size ?? 12, 0, title.bold ?? false);

    const drawHeader = () => {
      const page = this.currentPage(); // Will create new page if needed and update currentYpos
      point = { x: 0, y: this.currentYpos };

      page.drawRectangle({
        x: this.settings.leftMargin + (point.x ?? 0),
        y: point.y,
        width: width === 0 ? PageSizes.Letter[0] - 2 * this.settings.leftMargin : width,
        height: headerSize * 2,
        borderOpacity: 0,
        color: headerBgColor,
        opacity: 1,
      });

      this.currentYpos += headerSize / 2 + 1;
      for (const item of items) {
        const drawHeaderItem = (headerItem: HeaderElement) => {
          this.internalDrawText(
            headerItem.text,
            headerItem.color ?? rgb(0, 0, 0),
            headerSize,
            (point.x ?? 0) + (headerItem.x ?? 0),
            headerItem.bold,
            true
          );
        };
        // Header
        drawHeaderItem(item.header);
      }
      this.currentYpos = point.y;
    };
    drawHeader();

    // Items
    if (items.length > 0 && items[0] !== undefined && items[0].colItems !== undefined && items[0].colItems.length > 0) {
      // Reduce top margin below header
      this.currentYpos -= textSize + 1;
      const itemCount = items[0].colItems.length;
      for (let i = 0; i < itemCount; i++) {
        for (let j = 0; j < items.length; j++) {
          const headerItem = items[j];
          if (headerItem) {
            const singleItem = headerItem.colItems[i];
            if (
              singleItem &&
              this.internalDrawText(
                singleItem.text,
                singleItem.color ?? rgb(0, 0, 0),
                textSize,
                (point.x ?? 0) + (headerItem.header.x ?? 0),
                singleItem.bold,
                j !== items.length - 1
              )
            ) {
              drawHeader();
              this.currentYpos -= textSize + 1;
            }
          }
        }
      }
    }
    this.currentYpos -= textSize * 4;
  }

  public setStaticElements(elements: PDFElement[]): void {
    this.staticElements = elements;
  }

  public goto(pos: number): void {
    this.currentYpos = pos;
  }

  public async save(): Promise<Uint8Array> {
    // Draw headers and footers before save
    let index = 0;
    for (const page of this.pages) {
      index++;
      for (const element of this.staticElements) {
        let point = { ...element.point };
        point.x = (point.x ?? 0) + this.settings.leftMargin;
        switch (element.type) {
          case "TEXT":
            this.internalDrawTextOnPage(
              page,
              element.placeholder ?? "",
              element.color ?? rgb(0, 0, 0),
              element.size ?? 12,
              point,
              element.bold
            );
            break;
          case "IMAGE":
            const pngImage = await this.pdfDoc.embedPng(element.placeholder ?? "");
            const pngDims = pngImage.scale(element.aspectRatio ?? 1);
            page.drawImage(pngImage, {
              x: point.x,
              y: point.y,
              width: pngDims.width,
              height: pngDims.height,
            });
            break;
          case "PAGE":
            this.internalDrawTextOnPage(
              page,
              `Page ${index} of ${this.pages.length}`,
              element.color ?? rgb(0, 0, 0),
              element.size ?? 12,
              point,
              element.bold
            );
            break;
        }
      }
    }

    return this.pdfDoc.save();
  }

  public clear(): void {
    this.pages = [];
    this.currentYpos = 0;
  }
}

export { PDFHelper };
