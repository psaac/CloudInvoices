import React from "react";
import { Inline, DynamicTable } from "@forge/react";
import { Task } from "../../types";

export const TableTasks = ({ taskList, title }: { taskList: Array<Task>; title: string }) => {
  return (
    <Inline space="space.200">
      <DynamicTable
        caption={`${title} (${taskList.length})`}
        head={{
          cells: [
            { key: "key", content: "Key", isSortable: true },
            { key: "vendor", content: "Vendor", isSortable: true },
            { key: "accountId", content: "Application ID", isSortable: true },
            { key: "summary", content: "Description", isSortable: false },
            { key: "cost", content: "Cost", isSortable: true },
            { key: "error", content: "Error", isSortable: false },
          ],
        }}
        rows={taskList.map((task: Task, index: number) => ({
          key: index.toString(),
          cells: [
            { content: index.toString() },
            { content: task.CloudVendor },
            { content: task.u_account_id },
            { content: task.u_product_code },
            { content: task.u_cost },
            { content: task.Error ? `Error: ${task.Error}` : "" },
          ],
        }))}
        rowsPerPage={100}
        defaultSortKey="key"
        defaultSortOrder="ASC"
      />
    </Inline>
  );
};
