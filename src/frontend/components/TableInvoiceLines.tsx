import React from "react";
import { Link, Inline, DynamicTable } from "@forge/react";
import { InvoiceLine } from "../../backend/InvoiceLine";

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
          ],
        }}
        rows={data.map((invoiceLine: InvoiceLine, index: number) => ({
          key: index.toString(),
          cells: [
            { content: <Link href={invoiceLine.Link}>{invoiceLine.Key}</Link> },
            { content: invoiceLine.ChargebackIdStr },
            { content: invoiceLine.Summary },
          ],
        }))}
        rowsPerPage={100}
        defaultSortKey="key"
        defaultSortOrder="ASC"
      />
    </Inline>
  );
};
