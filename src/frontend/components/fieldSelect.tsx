import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";

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
  const [fields, setFields] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedField, setSelectedField] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const fetchField = async ({ fieldId }: { fieldId: string }) => {
      setLoading(true);
      try {
        const fetchedField = await invoke<{ id: string; name: string }>("getField", {
          fieldId,
        });
        setSelectedField({ value: fetchedField.id, label: fetchedField.name });
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
      const fetchedFields = await invoke<Array<{ id: string; name: string }>>("searchFields", {
        spaceId,
        query,
      });
      setFields(fetchedFields);
      if (fieldId && fieldId !== "") {
        const exists = fetchedFields.find((os) => os.id === fieldId);
        if (exists) setSelectedField({ value: exists.id, label: exists.name });
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
        options={fields.map((field) => ({
          label: field.name,
          value: field.id,
        }))}
        isLoading={loading}
        onInputChange={(input) => searchFields({ query: input })}
      />
    </Box>
  );
};
