import React from "react";
import { Stack, Box, Text } from "@forge/react";
// import { CloudData } from "../../backend/CloudData";
// import { LozengeError } from "../utils";
import { Invoices, Invoice } from "../Invoices";

export const TableInvoices = ({ invoices }: { invoices: Invoices }) => {
  return (
    <Stack>
      {Array.from(invoices.Invoices.values()).map((invoice: Invoice) => (
        <Box padding="space.100" xcss={{ boxShadow: "elevation.shadow.raised", borderRadius: "border.radius" }}>
          <Text>
            Customer: {invoice.Customer} | Amount: {invoice.TotalAmount}
          </Text>
        </Box>
      ))}
    </Stack>
  );
};
