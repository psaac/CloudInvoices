import React from "react";
import { Text, Lozenge } from "@forge/react";
import type { ThemeAppearance } from "@atlaskit/lozenge";
import { CloudData, CloudVendor } from "../backend/CloudData";

const internalLozenge = (text: string, appearance: ThemeAppearance) => {
  return (
    <Text>
      <Lozenge appearance={appearance} isBold>
        {text}
      </Lozenge>
    </Text>
  );
};

export const LozengeNew = () => {
  return internalLozenge("New", "default");
};

export const LozengeAssetOK = () => {
  return internalLozenge("Asset OK", "success");
};

export const LozengeError = ({ text }: { text: string }) => {
  return internalLozenge(text, "removed");
};

export const LozengeInProgress = () => {
  return internalLozenge("In Progress", "inprogress");
};

export const LozengeDone = () => {
  return internalLozenge("Done", "success");
};

export const allVendorsSelected = (selectedCloudData: Array<CloudData>, cloudVendors: Array<CloudVendor>): boolean => {
  const vendorSelectionCount = new Map<string, number>();
  cloudVendors.forEach((vendor: CloudVendor) => {
    vendorSelectionCount.set(vendor.value, 0);
  });

  // Count selections per vendor
  selectedCloudData.forEach((data: CloudData) => {
    vendorSelectionCount.set(data.CloudVendor.value, (vendorSelectionCount.get(data.CloudVendor.value) || 0) + 1);
  });

  for (const count of vendorSelectionCount.values()) {
    if (count !== 1) return false;
  }

  return true;
};

export const round2 = (num: number): number => {
  return Math.round(num * 100) / 100;
};
