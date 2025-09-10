import React from "react";
import { Text, Lozenge } from "@forge/react";
import type { ThemeAppearance } from "@atlaskit/lozenge";

export interface Month {
  label: string;
  value: string;
}

export function getLastMonths(count = 7): Month[] {
  const months: Month[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setMonth(now.getMonth() - i); // uses setMonth, safer then new Date(..., month - i)

    const label = d.toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
    });

    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    months.push({ label, value });
  }
  return months;
}

const internalLozenge = (text: string, appearance: ThemeAppearance) => {
  return (
    <Text>
      <Lozenge appearance={appearance} isBold>
        {text}
      </Lozenge>
    </Text>
  );
};

const LozengeNew = () => {
  return internalLozenge("New", "default");
};

const LozengeAssetOK = () => {
  return internalLozenge("Asset OK", "success");
};

const LozengeAssetError = () => {
  return internalLozenge("Asset Error", "removed");
};

const LozengeInProgress = () => {
  return internalLozenge("In Progress", "inprogress");
};

const LozengeDone = () => {
  return internalLozenge("Done", "success");
};

export { LozengeNew, LozengeAssetOK, LozengeAssetError, LozengeInProgress, LozengeDone };
