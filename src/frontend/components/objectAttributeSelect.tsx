import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const ObjectAttributeSelect = ({
  objectAttributeId,
  objectTypeId,
  workSpaceId,
  label,
  onChange,
}: {
  objectAttributeId: string;
  objectTypeId: string;
  workSpaceId: string;
  label: string;
  onChange: (newObjectSchemaId: string) => void;
}) => {
  const [objectAttributes, setObjectAttributes] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedObjectAttribute, setSelectedObjectAttribute] = useState<Option | null>(null);

  useEffect(() => {
    const fetchObjectAttributes = async ({
      workSpaceId,
      objectTypeId,
    }: {
      workSpaceId: string;
      objectTypeId: string;
    }) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedObjectAttributes = await invoke<Options>("getObjectAttributes", {
          workSpaceId,
          objectTypeId,
        });
        setObjectAttributes(fetchedObjectAttributes);

        if (objectAttributeId && objectAttributeId !== "") {
          const exists = fetchedObjectAttributes.find((os) => os.value === objectAttributeId);
          if (exists) setSelectedObjectAttribute(exists);
        }
      } catch (error) {
        console.error("Error searching object attributes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (workSpaceId && workSpaceId !== "" && objectTypeId && objectTypeId !== "")
      fetchObjectAttributes({ workSpaceId, objectTypeId });
  }, [objectAttributeId, objectTypeId, workSpaceId]);

  return (
    <Box xcss={{ width: "200px" }}>
      <Label labelFor="objectAttributeSelect">
        {label}
        <RequiredAsterisk />
      </Label>
      <Select
        id="objectAttributeSelect"
        value={selectedObjectAttribute}
        onChange={(option) => onChange(option.value)}
        options={objectAttributes}
        isLoading={loading}
        isSearchable={false}
      />
    </Box>
  );
};
