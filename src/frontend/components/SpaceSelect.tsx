import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const SpaceSelect = ({ spaceId, onChange }: { spaceId: string; onChange: (newSpaceId: string) => void }) => {
  const [spaces, setSpaces] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Option | null>(null);

  const searchSpaces = async (inputValue: string) => {
    if (loading || inputValue.length < 3) return;

    setLoading(true);
    try {
      const fetchedSpaces = await invoke<Options>("searchSpaces", {
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
          const space = await invoke<Option>("getSpace", { spaceId });
          if (space) {
            setSpaces([space]);
            setSelectedSpace(space);
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
        options={spaces}
        onInputChange={searchSpaces}
        isLoading={loading}
      />
    </Box>
  );
};
