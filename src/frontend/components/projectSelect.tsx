import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";

export const SpaceSelect = ({ spaceId, onChange }: { spaceId: string; onChange: (newSpaceId: string) => void }) => {
  const [spaces, setSpaces] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<{ value: string; label: string } | null>(null);

  const searchSpaces = async (inputValue: string) => {
    if (loading || inputValue.length < 3) return;

    setLoading(true);
    try {
      const fetchedSpaces = await invoke<Array<{ id: string; name: string }>>("searchSpaces", {
        query: inputValue,
      });
      setSpaces(fetchedSpaces);
    } catch (error) {
      console.error("Error searching spaces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSpace = async () => {
      if (spaceId && spaceId !== "") {
        setLoading(true);
        try {
          const space = await invoke<{ id: string; name: string }>("getSpace", { spaceId });
          if (space) {
            setSpaces([space]);
            setSelectedSpace({ value: space.id, label: space.name });
          }
        } catch (error) {
          console.error("Error fetching space:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSpace();
  }, [spaceId]);

  return (
    <Box xcss={{ width: "200px" }}>
      <Label labelFor="spaceSelect">
        Space
        <RequiredAsterisk />
      </Label>
      <Select
        id="spaceSelect"
        value={selectedSpace}
        onChange={(option) => onChange(option.value)}
        options={spaces.map((space) => ({ label: space.name, value: space.id }))}
        onInputChange={searchSpaces}
        isLoading={loading}
      />
    </Box>
  );
};
