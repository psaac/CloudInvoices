import React from "react";
import { Inline, Box, Spinner, Text } from "@forge/react";
const loading = () => {
  return (
    <Inline space="space.200">
      <Box>
        <Spinner label="loading" />
      </Box>
      <Box>
        <Text>Loading...</Text>
      </Box>
    </Inline>
  );
};

export default loading;
