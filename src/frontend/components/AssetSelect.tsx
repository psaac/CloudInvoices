import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const AssetSelect = ({
  workSpaceId,
  objectTypeId,
  assetId,
  label,
  onChange,
}: {
  workSpaceId: string;
  objectTypeId: string;
  assetId: string;
  label: string;
  onChange: (newFieldId: string) => void;
}) => {
  const [assets, setAssets] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Option | null>(null);

  useEffect(() => {
    const fetchAsset = async ({ assetId }: { assetId: string }) => {
      setLoading(true);
      try {
        const fetchedAsset = await invoke<Option>("getAsset", {
          workSpaceId,
          assetId,
        });
        setSelectedAsset(fetchedAsset);
      } catch (error) {
        console.error("Error fetching asset:", error);
      } finally {
        setLoading(false);
      }
    };
    if (assetId && assetId !== "") fetchAsset({ assetId });
  }, [assetId]);

  const searchAssets = async ({ query }: { query: string }) => {
    if (loading || query.length < 3) return;

    setLoading(true);
    try {
      const fetchedAssets = await invoke<Options>("searchAssets", {
        workSpaceId,
        objectTypeId,
        query,
      });
      setAssets(fetchedAssets);
      if (assetId && assetId !== "") {
        const exists = fetchedAssets.find((os) => os.value === assetId);
        if (exists) setSelectedAsset(exists);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box xcss={{ width: "250px" }}>
      <Label labelFor="fieldSelect">
        {label}
        <RequiredAsterisk />
      </Label>
      <Select
        id="fieldSelect"
        value={selectedAsset}
        onChange={(option) => onChange(option.value)}
        options={assets}
        isLoading={loading}
        onInputChange={(input) => searchAssets({ query: input })}
      />
    </Box>
  );
};
