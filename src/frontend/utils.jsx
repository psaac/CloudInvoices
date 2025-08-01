import React from "react";
import { Text, Lozenge } from "@forge/react";
export function getLastMonths(count = 7) {
  const months = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i); // uses setMonth, safer then new Date(..., month - i)

    const label = d.toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
    });

    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    months.push({ label, value });
  }
  return months;
}

const LozengeNew = () => (
  <Text>
    <Lozenge isBold>New</Lozenge>
  </Text>
);

const LozengeAssetOK = () => (
  <Text>
    <Lozenge appearance="success" isBold>
      Asset OK
    </Lozenge>
  </Text>
);

const LozengeAssetError = () => (
  <Text>
    <Lozenge appearance="removed" isBold>
      Asset Error
    </Lozenge>
  </Text>
);

export { LozengeNew, LozengeAssetOK, LozengeAssetError };
