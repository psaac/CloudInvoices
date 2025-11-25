import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";

export const ObjectSchemaSelect = ({
  objectSchemaId,
  workSpaceId,
  onChange,
}: {
  objectSchemaId: string;
  workSpaceId: string;
  onChange: (newObjectSchemaId: string) => void;
}) => {
  const [objectsSchemas, setObjectsSchemas] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedObjectSchema, setSelectedObjectSchema] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const fetchObjectSchemas = async (workSpaceId: string) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedObjectSchemas = await invoke<Array<{ id: string; name: string }>>("getObjectSchemas", {
          workSpaceId,
        });
        setObjectsSchemas(fetchedObjectSchemas);

        if (objectSchemaId && objectSchemaId !== "") {
          const exists = fetchedObjectSchemas.find((os) => os.id === objectSchemaId);
          if (exists) setSelectedObjectSchema({ value: exists.id, label: exists.name });
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
        options={objectsSchemas.map((objectSchema) => ({ label: objectSchema.name, value: objectSchema.id }))}
        isLoading={loading}
        isSearchable={false}
      />
    </Box>
  );
};
