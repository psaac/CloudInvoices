import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";

export const WorkSpaceSelect = ({
  workSpaceId,
  onChange,
}: {
  workSpaceId: string;
  onChange: (newWorkSpaceId: string) => void;
}) => {
  const [workSpaces, setWorkSpaces] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkSpace, setSelectedWorkSpace] = useState<{ value: string; label: string } | null>(null);

  useEffect(() => {
    const fetchWorkSpaces = async () => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedWorkSpaces = await invoke<Array<{ id: string; name: string }>>("getWorkSpaces", {});
        setWorkSpaces(fetchedWorkSpaces);

        if (workSpaceId && workSpaceId !== "") {
          const exists = fetchedWorkSpaces.find((ws) => ws.id === workSpaceId);
          if (exists) setSelectedWorkSpace({ value: exists.id, label: exists.name });
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
        options={workSpaces.map((workSpace) => ({ label: workSpace.name, value: workSpace.id }))}
        isLoading={loading}
        isSearchable={false}
      />
    </Box>
  );
};
