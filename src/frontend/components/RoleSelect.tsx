import React, { useEffect, useState } from "react";
import { Box, Label, Select, RequiredAsterisk } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Option, Options } from "../../types";

export const RoleSelect = ({
  spaceId,
  roleId,
  onChange,
  label,
}: {
  spaceId: string;
  roleId: string;
  onChange: (newRoleId: string) => void;
  label: string;
}) => {
  const [roles, setRoles] = useState<Options>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Option | null>(null);
  useEffect(() => {
    const fetchRoles = async (spaceId: string) => {
      if (loading) return;

      setLoading(true);
      try {
        const fetchedRoles = await invoke<Options>("getSpaceRoles", {
          spaceId,
        });
        setRoles(fetchedRoles);

        if (roleId && roleId !== "") {
          const exists = fetchedRoles.find((os) => os.value === roleId);
          if (exists) setSelectedRole(exists);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (spaceId && spaceId !== "") fetchRoles(spaceId);
  }, [roleId, spaceId]);

  return (
    <Box xcss={{ width: "280px" }}>
      <Label labelFor="roleSelect">
        {label}
        <RequiredAsterisk />
      </Label>
      <Select
        id="roleSelect"
        value={selectedRole}
        onChange={(option) => onChange(option.value)}
        options={roles}
        isSearchable={false}
        isLoading={loading}
      />
    </Box>
  );
};
