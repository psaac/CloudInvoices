import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const WorkTypeSelect = ({
  spaceId,
  workTypeId,
  onChange,
  label,
  subTaskType,
}: {
  spaceId: string;
  workTypeId: string;
  onChange: (newWorkTypeId: string) => void;
  label: string;
  subTaskType: boolean;
}) => {
  const [workTypes, setWorkTypes] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkType, setSelectedWorkType] = useState<Option | null>(null);

  useEffect(() => {
    const fetchWorkTypes = async (spaceId: string) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedWorkTypes = await invoke<Options>("getWorkTypes", {
          spaceId,
          subTaskType,
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
        const workType = await invoke<Option>("getWorkType", { workTypeId });
        if (workType) {
          setWorkTypes([workType]);
          setSelectedWorkType(workType);
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
        options={workTypes}
        isSearchable={false}
        isLoading={loading}
      />
    </Box>
  );
};
