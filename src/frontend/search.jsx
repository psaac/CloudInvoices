import React from "react";
import { Inline, Box, Label, Button, Select } from "@forge/react";

const SearchComponent = ({
  months,
  selectedMonth,
  setSelectedMonth,
  handleSearch,
  loading,
}) => {
  return (
    <Inline alignBlock="end" space="space.050">
      <Box xcss={{ width: "200px" }}>
        <Label labelFor="selectMonth">Select month :</Label>
        <Select
          id="selectMonth"
          label="Month"
          onChange={(e) => {
            setSelectedMonth(e.value);
          }}
          defaultValue={months[0]}
          options={months}
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
/*
<Inline alignBlock="end" space="space.050">
            <Box xcss={{ width: "200px" }}>
              <Label labelFor="selectMonth">Select month :</Label>
              <Select
                id="selectMonth"
                label="Month"
                onChange={(e) => {
                  setSelectedMonth(e.value);
                }}
                defaultValue={months[0]}
                options={months}
              ></Select>
            </Box>

            <Box xcss={{ width: "200px" }}>
              <Button
                onClick={handleSearch}
                isDisabled={loading || !selectedMonth}
              >
                Search
              </Button>
            </Box>
          </Inline>
*/
//import React, { useState, useEffect } from "react";
