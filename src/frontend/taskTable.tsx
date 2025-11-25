import React from "react";
import { Inline, DynamicTable, Link } from "@forge/react";
import { Task } from "../types";
// import { LozengeNew, LozengeAssetOK, LozengeAssetError, LozengeInProgress, LozengeDone } from "./utils";

export const TaskTable = ({ taskList }: { taskList: Task[] }) => {
  const title = `Tasks (${taskList.length})`;
  return (
    <Inline space="space.200">
      <DynamicTable
        caption={title}
        head={{
          cells: [
            //{ key: "batchId", content: "Batch ID", isSortable: false },
            { key: "billingMonth", content: "Billing Month", isSortable: true },
            { key: "key", content: "Key", isSortable: true },
            { key: "externalId", content: "External ID", isSortable: true },
            { key: "accountId", content: "Application ID", isSortable: true },
            { key: "summary", content: "Description", isSortable: false },
            { key: "cost", content: "Cost", isSortable: true },
          ],
        }}
        rows={taskList.map((task: Task) => ({
          key: task.Key,
          cells: [
            { content: task.BillingMonth },
            {
              content: <Link href={`${task.link}`}>{task.Key}</Link>,
            },
            { content: task.ExternalId },
            { content: task.AccountId },
            { content: task.Summary },
            { content: task.Cost },
          ],
        }))}
        rowsPerPage={100}
        defaultSortKey="key"
        defaultSortOrder="ASC"
      />
    </Inline>
  );
};
