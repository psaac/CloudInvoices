import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const ObjectSchemaSelect = ({
  objectSchemaId,
  workSpaceId,
  onChange,
}: {
  objectSchemaId: string;
  workSpaceId: string;
  onChange: (newObjectSchemaId: string) => void;
}) => {
  const [objectsSchemas, setObjectsSchemas] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedObjectSchema, setSelectedObjectSchema] = useState<Option | null>(null);

  useEffect(() => {
    const fetchObjectSchemas = async (workSpaceId: string) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedObjectSchemas = await invoke<Options>("getObjectSchemas", {
          workSpaceId,
        });
        setObjectsSchemas(fetchedObjectSchemas);

        if (objectSchemaId && objectSchemaId !== "") {
          const exists = fetchedObjectSchemas.find((os) => os.value === objectSchemaId);
          if (exists) setSelectedObjectSchema(exists);
        }
      } catch (error) {
        console.error("Error searching workSpaces:", error);
      } finally {
        setLoading(false);
      }
    };

    if (workSpaceId && workSpaceId !== "") fetchObjectSchemas(workSpaceId);
  }, [objectSchemaId, workSpaceId]);

  return (
    <Box xcss={{ width: "200px" }}>
      <Label labelFor="workSpaceSelect">
        Object schema for assets
        <RequiredAsterisk />
      </Label>
      <Select
        id="workSpaceSelect"
        value={selectedObjectSchema}
        onChange={(option) => onChange(option.value)}
        options={objectsSchemas}
        isLoading={loading}
        isSearchable={false}
      />
    </Box>
  );
};
