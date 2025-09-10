import React from "react";
import { Inline, Box, Label, Button, Select } from "@forge/react";
import { Month } from "./utils";

interface SearchParams {
  months: Month[];
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  handleSearch: () => void;
  loading: boolean;
}

const SearchComponent = ({ months, selectedMonth, setSelectedMonth, handleSearch, loading }: SearchParams) => {
  return (
    <Inline alignBlock="end" space="space.050">
      <Box xcss={{ width: "200px" }}>
        <Label labelFor="selectMonth">Select month :</Label>
        <Select
          id="selectMonth"
          onChange={(e) => {
            setSelectedMonth(e.value);
          }}
          defaultValue={months[0]}
          options={months}
          isDisabled={loading}
        ></Select>
      </Box>

      <Box xcss={{ width: "200px" }}>
        <Button onClick={handleSearch} isDisabled={loading || !selectedMonth}>
          Search
        </Button>
      </Box>
    </Inline>
  );
};

export default SearchComponent;
