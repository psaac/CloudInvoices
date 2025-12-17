import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const FieldSelect = ({
  fieldId,
  spaceId,
  label,
  onChange,
}: {
  fieldId: string;
  spaceId: string;
  label: string;
  onChange: (newFieldId: string) => void;
}) => {
  const [fields, setFields] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<Option | null>(null);

  useEffect(() => {
    const fetchField = async ({ fieldId }: { fieldId: string }) => {
      setLoading(true);
      try {
        const fetchedField = await invoke<Option>("getField", {
          fieldId,
        });
        setSelectedField(fetchedField);
      } catch (error) {
        console.error("Error fetching field:", error);
      } finally {
        setLoading(false);
      }
    };
    if (fieldId && fieldId !== "") fetchField({ fieldId });
  }, [fieldId]);

  const searchFields = async ({ query }: { query: string }) => {
    if (loading || query.length < 3) return;

    setLoading(true);
    try {
      const fetchedFields = await invoke<Options>("searchFields", {
        spaceId,
        query,
      });
      setFields(fetchedFields);
      if (fieldId && fieldId !== "") {
        const exists = fetchedFields.find((os) => os.value === fieldId);
        if (exists) setSelectedField(exists);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
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
        value={selectedField}
        onChange={(option) => onChange(option.value)}
        options={fields}
        isLoading={loading}
        onInputChange={(input) => searchFields({ query: input })}
      />
    </Box>
  );
};
