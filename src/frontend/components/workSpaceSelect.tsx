import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const WorkSpaceSelect = ({
  workSpaceId,
  onChange,
}: {
  workSpaceId: string;
  onChange: (newWorkSpaceId: string) => void;
}) => {
  const [workSpaces, setWorkSpaces] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkSpace, setSelectedWorkSpace] = useState<Option | null>(null);

  useEffect(() => {
    const fetchWorkSpaces = async () => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedWorkSpaces = await invoke<Options>("getWorkSpaces", {});
        setWorkSpaces(fetchedWorkSpaces);

        if (workSpaceId && workSpaceId !== "") {
          const exists = fetchedWorkSpaces.find((ws) => ws.value === workSpaceId);
          if (exists) setSelectedWorkSpace(exists);
        }
      } catch (error) {
        console.error("Error searching workSpaces:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkSpaces();
  }, [workSpaceId]);

  return (
    <Box xcss={{ width: "350px" }}>
      <Label labelFor="workSpaceSelect">
        Workspace for assets
        <RequiredAsterisk />
      </Label>
      <Select
        id="workSpaceSelect"
        value={selectedWorkSpace}
        onChange={(option) => onChange(option.value)}
        options={workSpaces}
        isLoading={loading}
        isSearchable={false}
      />
    </Box>
  );
};
