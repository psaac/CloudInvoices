import React, { useState } from "react";
import { Stack, Box, Text, Button, Icon, Inline, xcss } from "@forge/react";
// import { CloudData } from "../../backend/CloudData";
// import { LozengeError } from "../utils";
import { Invoices, Invoice } from "../Invoices";
// import EyeOpenIcon from '@atlaskit/icon/core/eye-open';

export const TableInvoices = ({ invoices }: { invoices: Invoices }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const showInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <Inline space="space.100">
      <Box xcss={xcss({ width: "50%" })}>
        <Stack>
          <Text size="large" weight="bold">
            Total amount: {invoices.TotalAmount.toFixed(2)} | Network Shared Costs:{" "}
            {invoices.NetworkSharedCosts.toFixed(2)}
          </Text>
          {Array.from(invoices.Invoices.values()).map((invoice: Invoice) => (
            <>
              <Box
                padding="space.100"
                xcss={{
                  boxShadow: "elevation.shadow.raised",
                  borderRadius: "border.radius",
                  backgroundColor:
                    selectedInvoice?.CustomerId === invoice.CustomerId
                      ? "color.background.selected"
                      : "color.background.neutral",
                }}
              >
                <Inline space="space.100" spread="space-between">
                  <Stack>
                    <Text>
                      Customer: {invoice.Customer} | Amount: {invoice.TotalAmount.toFixed(2)}
                    </Text>
                    <Text>Notify invoice to: {invoice.emailsToNotify.join(", ")}</Text>
                  </Stack>
                  <Button onClick={() => showInvoiceDetails(invoice)}>
                    <Icon glyph="info" label="" />
                  </Button>
                </Inline>
              </Box>
            </>
          ))}
        </Stack>
      </Box>
      <Box xcss={xcss({ width: "50%" })}>
        {selectedInvoice && (
          <Box>
            <Text size="large" weight="bold">
              Project {selectedInvoice.Customer} | Total: {selectedInvoice.TotalAmount.toFixed(2)}
            </Text>
            {Array.from(selectedInvoice.CostsByVendor.values()).map((vendorCost) => (
              <Box
                key={vendorCost.Vendor}
                padding="space.100"
                xcss={{ boxShadow: "elevation.shadow.raised", borderRadius: "border.radius" }}
              >
                <Text>
                  Vendor: {vendorCost.Vendor} | Amount: {vendorCost.TotalAmount.toFixed(2)}
                </Text>
                {Array.from(vendorCost.CostsByAppAccount.values()).map((appAccountCost) => (
                  <Box
                    key={appAccountCost.AppId}
                    padding="space.100"
                    xcss={{ boxShadow: "elevation.shadow.raised", borderRadius: "border.radius" }}
                  >
                    <Text>
                      App Account ID: {appAccountCost.AppName} | Amount: {appAccountCost.TotalAmount.toFixed(2)}
                    </Text>
                    {appAccountCost.Tasks.map((task) => (
                      <Box
                      //padding="space.100"
                      // xcss={{ boxShadow: "elevation.shadow.raised", borderRadius: "border.radius" }}
                      >
                        <Text size="small">
                          {task.Summary}: {task.Cost.toFixed(2)}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Inline>
  );
};
