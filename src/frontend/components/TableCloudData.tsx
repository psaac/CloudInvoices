import React from "react";
import { Stack, Box, Text, Checkbox, Link, Icon, Inline, Tooltip, Heading } from "@forge/react";
import { CloudData } from "../../backend/CloudData";
import { LozengeError } from "../utils";

export const CloudDataTable = ({
  data,
  onSelect,
}: {
  data: Array<CloudData>;
  onSelect: (cloudData: CloudData, selected: boolean) => void;
}) => {
  return (
    <Stack space="space.100">
      <Heading size="medium">Input Cloud Data (select one per vendor)</Heading>
      {data.map((item) => {
        return (
          <Box
            padding="space.100"
            xcss={{
              boxShadow: "elevation.shadow.raised",
              borderRadius: "border.radius",
            }}
          >
            <Inline space="space.100">
              <Checkbox
                value="default"
                label={item.Summary}
                onChange={(event) => onSelect(item, event.target.checked ?? false)}
                isDisabled={item.Attachments.length === 0}
              />
              {item.Attachments.length > 0 && (
                <Tooltip content={item.Attachments.map((att) => att.filename).join(", ")}>
                  <Icon glyph="attachment" label="" />
                </Tooltip>
              )}
              {item.Attachments.length === 0 && <LozengeError text="No attachment" />}
            </Inline>
            <Text>
              <Link href={item.Link} openNewTab={true}>
                {item.Key}
              </Link>
              &nbsp;| BillingMonth: {item.BillingMonth} | BatchId: {item.BatchId} | CloudVendor:{" "}
              {item.CloudVendor.value}
            </Text>
          </Box>
        );
      })}
    </Stack>
  );
};
