import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";

export const WorkTypeSelect = ({
  spaceId,
  workTypeId,
  onChange,
  label,
}: {
  spaceId: string;
  workTypeId: string;
  onChange: (newWorkTypeId: string) => void;
  label: string;
}) => {
  const [workTypes, setWorkTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const fetchWorkTypes = async (spaceId: string) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedWorkTypes = await invoke<Array<{ id: string; name: string }>>("getWorkTypes", {
          spaceId,
        });
        setWorkTypes(fetchedWorkTypes);
      } catch (error) {
        console.error("Error fetching work types:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchWorkType = async (workTypeId: string) => {
      setLoading(true);
      try {
        const workType = await invoke<{ id: string; name: string }>("getWorkType", { workTypeId });
        if (workType) {
          setWorkTypes([workType]);
          setSelectedWorkType({ value: workType.id, label: workType.name });
        }
      } catch (error) {
        console.error("Error fetching work type:", error);
      } finally {
        setLoading(false);
      }
    };
    if (spaceId && spaceId !== "") fetchWorkTypes(spaceId);
    if (workTypeId && workTypeId !== "") fetchWorkType(workTypeId);
  }, [workTypeId, spaceId]);

  return (
    <Box xcss={{ width: "280px" }}>
      <Label labelFor="workTypeSelect">
        {label}
        <RequiredAsterisk />
      </Label>
      <Select
        id="workTypeSelect"
        value={selectedWorkType}
        onChange={(option) => onChange(option.value)}
        options={workTypes.map((workType) => ({ label: workType.name, value: workType.id }))}
        isSearchable={false}
        isLoading={loading}
      />
    </Box>
  );
};
