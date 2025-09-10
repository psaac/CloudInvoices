import React from "react";
import { Inline, DynamicTable, Link } from "@forge/react";
import { LozengeNew, LozengeAssetOK, LozengeAssetError, LozengeInProgress, LozengeDone } from "./utils";

export enum ShowAccountInfos {
  None,
  ChargebackOnly,
  All,
}

interface ChargebackInListParams {
  chargebackInList: any[];
  title: string;
  showAccountInfos?: ShowAccountInfos;
}

const ChargebackInList = ({ chargebackInList, title, showAccountInfos }: ChargebackInListParams) => {
  const localShowAccountInfos = showAccountInfos ?? ShowAccountInfos.All;
  return (
    <Inline space="space.200">
      <DynamicTable
        caption={title}
        head={{
          cells: [
            { key: "key", content: "Key", isSortable: true },
            { key: "summary", content: "Summary", isSortable: false },
            ...(localShowAccountInfos !== ShowAccountInfos.ChargebackOnly
              ? [
                  {
                    key: "appAccountId",
                    content: "Application Account ID",
                    isSortable: true,
                  },
                ]
              : []),
            ...(localShowAccountInfos >= ShowAccountInfos.ChargebackOnly
              ? [
                  ...(localShowAccountInfos === ShowAccountInfos.All
                    ? [
                        {
                          key: "appAccountName",
                          content: "App. account name",
                          isSortable: false,
                        },
                      ]
                    : []),
                  {
                    key: "cbAccountName",
                    content: "Chargeback account name",
                    isSortable: false,
                  },
                ]
              : []),

            { key: "status", content: "Status", isSortable: true },
            { key: "cost", content: "Cost", isSortable: true },
          ],
        }}
        rows={chargebackInList.map((chargebackIn: any) => ({
          key: chargebackIn.key,
          cells: [
            {
              content: <Link href={`${chargebackIn.link}`}>{chargebackIn.key}</Link>,
            },
            { content: chargebackIn.summary },
            ...(localShowAccountInfos !== ShowAccountInfos.ChargebackOnly
              ? [{ content: chargebackIn.appAccountId }]
              : []),
            ...(localShowAccountInfos >= ShowAccountInfos.ChargebackOnly
              ? [
                  ...(localShowAccountInfos === ShowAccountInfos.All ? [{ content: chargebackIn.appAccountName }] : []),
                  { content: chargebackIn.cbAccountName },
                ]
              : []),
            {
              content: (() => {
                switch (chargebackIn.status.toUpperCase()) {
                  case "NEW":
                    return <LozengeNew />;
                  case "ASSET OK":
                    return <LozengeAssetOK />;
                  case "IN PROGRESS":
                    return <LozengeInProgress />;
                  case "ASSET ERROR":
                    return <LozengeAssetError />;
                  case "CLOSED":
                  case "DONE":
                    return <LozengeDone />;
                  default:
                    return null;
                }
              })(),
            },
            { content: chargebackIn.cost },
          ],
        }))}
        rowsPerPage={10}
        defaultSortKey="key"
        defaultSortOrder="ASC"
      />
    </Inline>
  );
};
export default ChargebackInList;
