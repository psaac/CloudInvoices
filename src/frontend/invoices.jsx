import React, { useState, useEffect } from "react";
import { Inline, DynamicTable, Link } from "@forge/react";
import { LozengeNew, LozengeAssetOK, LozengeAssetError } from "./utils";

const Invoices = ({ invoices, title, showAccountInfos = true }) => {
  return (
    <Inline space="space.200">
      <DynamicTable
        caption={title}
        head={{
          cells: [
            { key: "key", content: "Key", isSortable: true },
            { key: "summary", content: "Summary", isSortable: false },
            {
              key: "appAccountId",
              content: "Application Account ID",
              isSortable: true,
            },
            ...(showAccountInfos
              ? [
                  {
                    key: "appAccountName",
                    content: "App. account name",
                    isSortable: false,
                  },
                  {
                    key: "cbAccountName",
                    content: "Chargeback account name",
                    isSortable: false,
                  },
                ]
              : []),
            { key: "status", content: "Status", isSortable: true },
          ],
        }}
        rows={invoices.map((invoice) => ({
          key: invoice.key,
          cells: [
            { content: <Link href={`${invoice.link}`}>{invoice.key}</Link> },
            { content: invoice.summary },
            { content: invoice.appAccountId },
            ...(showAccountInfos
              ? [
                  { content: invoice.appAccountName },
                  { content: invoice.cbAccountName },
                ]
              : []),
            {
              content:
                invoice.status === "New" ? (
                  <LozengeNew />
                ) : invoice.status === "Asset OK" ? (
                  <LozengeAssetOK />
                ) : (
                  <LozengeAssetError />
                ),
            },
          ],
        }))}
        rowsPerPage={10}
        defaultSortKey="key"
        defaultSortOrder="ASC"
      />
    </Inline>
  );
};
export default Invoices;
