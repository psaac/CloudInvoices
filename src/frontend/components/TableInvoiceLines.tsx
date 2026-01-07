import React from "react";
import { Link, Inline, DynamicTable } from "@forge/react";
import { InvoiceLine } from "../../backend/InvoiceLine";
import { LozengeDone, LozengeInProgress, LozengeNew } from "../Graphics";

export const InvoiceLinesTable = ({ data }: { data: Array<InvoiceLine> }) => {
  return (
    <Inline space="space.200">
      <DynamicTable
        caption="Invoices"
        head={{
          cells: [
            { key: "key", content: "Key", isSortable: true },
            { key: "id", content: "ChargebackIdStr", isSortable: true },
            { key: "summary", content: "Summary", isSortable: true },
            { key: "status", content: "Status", isSortable: false },
          ],
        }}
        rows={data.map((invoiceLine: InvoiceLine, index: number) => ({
          key: index.toString(),
          cells: [
            { content: <Link href={invoiceLine.Link}>{invoiceLine.Key}</Link> },
            { content: invoiceLine.ChargebackIdStr },
            { content: invoiceLine.Summary },
            {
              content:
                invoiceLine.Status === "Done" || invoiceLine.Status === "Closed" ? (
                  <LozengeDone text={invoiceLine.ChargebackIdStr === "-" ? "IDoc files sent" : "PDF Invoice sent"} />
                ) : invoiceLine.Status === "In Progress" ? (
                  <LozengeInProgress
                    text={invoiceLine.ChargebackIdStr === "-" ? "Sending IDoc files" : "Sending PDF Invoice"}
                  />
                ) : (
                  <LozengeNew
                    text={
                      invoiceLine.ChargebackIdStr === "-" ? "Ready to send IDoc files" : "Ready to send PDF Invoice"
                    }
                  />
                ),
            },
          ],
        }))}
        rowsPerPage={100}
        defaultSortKey="key"
        defaultSortOrder="ASC"
      />
    </Inline>
  );
};
