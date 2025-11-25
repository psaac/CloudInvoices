import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";

export const ObjectTypeSelect = ({
  objectTypeId,
  objectSchemaId,
  workSpaceId,
  label,
  onChange,
}: {
  objectTypeId: string;
  objectSchemaId: string;
  workSpaceId: string;
  label: string;
  onChange: (newObjectSchemaId: string) => void;
}) => {
  const [objectTypes, setObjectTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const fetchObjectTypes = async ({
      workSpaceId,
      objectSchemaId,
    }: {
      workSpaceId: string;
      objectSchemaId: string;
    }) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedObjectTypes = await invoke<Array<{ id: string; name: string }>>("getObjectTypes", {
          workSpaceId,
          objectSchemaId,
        });
        setObjectTypes(fetchedObjectTypes);

        if (objectTypeId && objectTypeId !== "") {
          const exists = fetchedObjectTypes.find((os) => os.id === objectTypeId);
          if (exists) setSelectedObjectType({ value: exists.id, label: exists.name });
        }
      } catch (error) {
        console.error("Error searching workSpaces:", error);
      } finally {
        setLoading(false);
      }
    };

    if (workSpaceId && workSpaceId !== "" && objectSchemaId && objectSchemaId !== "")
      fetchObjectTypes({ workSpaceId, objectSchemaId });
  }, [objectTypeId, objectSchemaId, workSpaceId]);

  return (
    <Box xcss={{ width: "250px" }}>
      <Label labelFor="workSpaceSelect">
        {label}
        <RequiredAsterisk />
      </Label>
      <Select
        id="workSpaceSelect"
        value={selectedObjectType}
        onChange={(option) => onChange(option.value)}
        options={objectTypes.map((objectType) => ({ label: objectType.name, value: objectType.id }))}
        isLoading={loading}
        isSearchable={false}
      />
    </Box>
  );
};
