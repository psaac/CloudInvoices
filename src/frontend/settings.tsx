import React from "react";
import { invoke } from "@forge/bridge";
import { Inline, Stack, Button, Box, Text, Textfield, Label } from "@forge/react";
import { Settings } from "../types";
import { SpaceSelect } from "./components/projectSelect";
import { WorkTypeSelect } from "./components/workTypeSelect";
import { WorkSpaceSelect } from "./components/workSpaceSelect";
import { ObjectSchemaSelect } from "./components/objectSchemaSelect";
import { ObjectTypeSelect } from "./components/objectTypeSelect";
import { ObjectAttributeSelect } from "./components/objectAttributeSelect";
import { YellowBox, BlueBox } from "./components/roundedbox";
import { FieldSelect } from "./components/fieldSelect";

export const SettingsTab = ({
  settings,
  loading,
  onChange,
}: {
  settings: Settings;
  loading: boolean;
  onChange: (newSettings: Settings) => void;
}) => {
  const saveSettings = async () => {
    loading = true;
    try {
      await invoke("setSettings", {
        settings,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      loading = false;
    }
  };

  return (
    <Stack alignInline="start" space="space.200" grow="fill">
      {loading && <Text>Loading...</Text>}
      {!loading && (
        <>
          <SpaceSelect
            spaceId={settings.spaceId || ""}
            onChange={(newSpaceId: string) => {
              const newSettings = { ...settings, spaceId: newSpaceId };
              onChange(newSettings);
            }}
          />

          <BlueBox title="Source task work type">
            <WorkTypeSelect
              label="Work type"
              spaceId={settings.spaceId || ""}
              workTypeId={settings.taskWorkTypeId || ""}
              onChange={(newWorkTypeId: string) => {
                const newSettings = { ...settings, taskWorkTypeId: newWorkTypeId };
                onChange(newSettings);
              }}
            />
            <Inline alignInline="start" space="space.200">
              <FieldSelect
                label="Field for batch id"
                fieldId={settings.inputFieldBatchId || ""}
                spaceId={settings.spaceId || ""}
                onChange={(newFieldId: string) => {
                  const newSettings = { ...settings, inputFieldBatchId: newFieldId };
                  onChange(newSettings);
                }}
              />
              <FieldSelect
                label="Field for billing month"
                fieldId={settings.inputFieldBillingMonth || ""}
                spaceId={settings.spaceId || ""}
                onChange={(newFieldId: string) => {
                  const newSettings = { ...settings, inputFieldBillingMonth: newFieldId };
                  onChange(newSettings);
                }}
              />
              <FieldSelect
                label="Field for External Id"
                fieldId={settings.inputFieldExternalId || ""}
                spaceId={settings.spaceId || ""}
                onChange={(newFieldId: string) => {
                  const newSettings = { ...settings, inputFieldExternalId: newFieldId };
                  onChange(newSettings);
                }}
              />
            </Inline>
            <Inline alignInline="start" space="space.200">
              <FieldSelect
                label="Field for AccountId/SubscriptionId"
                fieldId={settings.inputFieldAccountId || ""}
                spaceId={settings.spaceId || ""}
                onChange={(newFieldId: string) => {
                  const newSettings = { ...settings, inputFieldAccountId: newFieldId };
                  onChange(newSettings);
                }}
              />
              <FieldSelect
                label="Field for cost rate"
                fieldId={settings.inputFieldCost || ""}
                spaceId={settings.spaceId || ""}
                onChange={(newFieldId: string) => {
                  const newSettings = { ...settings, inputFieldCost: newFieldId };
                  onChange(newSettings);
                }}
              />
            </Inline>
          </BlueBox>

          <BlueBox title="Target work type (storing DBT and Invoices)">
            <WorkTypeSelect
              label="Work type"
              spaceId={settings.spaceId || ""}
              workTypeId={settings.targetWorkTypeId || ""}
              onChange={(newWorkTypeId: string) => {
                const newSettings = { ...settings, targetWorkTypeId: newWorkTypeId };
                onChange(newSettings);
              }}
            />
          </BlueBox>

          <Inline alignInline="start" space="space.200">
            <WorkSpaceSelect
              workSpaceId={settings.workSpaceId || ""}
              onChange={(newWorkSpaceId: string) => {
                const newSettings = { ...settings, workSpaceId: newWorkSpaceId };
                onChange(newSettings);
              }}
            />
          </Inline>
          <Inline alignInline="start" space="space.200">
            <ObjectSchemaSelect
              objectSchemaId={settings.objectSchemaId || ""}
              workSpaceId={settings.workSpaceId || ""}
              onChange={(newObjectSchemaId: string) => {
                const newSettings = { ...settings, objectSchemaId: newObjectSchemaId };
                onChange(newSettings);
              }}
            />
          </Inline>

          <YellowBox title="Application Asset">
            <ObjectTypeSelect
              objectTypeId={settings.applicationObjectTypeId || ""}
              objectSchemaId={settings.objectSchemaId || ""}
              workSpaceId={settings.workSpaceId || ""}
              label="Object type for Applications"
              onChange={(newObjectTypeId: string) => {
                const newSettings = { ...settings, applicationObjectTypeId: newObjectTypeId };
                onChange(newSettings);
              }}
            />
            <Inline alignInline="start" space="space.200">
              <ObjectAttributeSelect
                objectAttributeId={settings.applicationObjectAttributeId || ""}
                objectTypeId={settings.applicationObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="Application Id"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = { ...settings, applicationObjectAttributeId: newObjectAttributeId };
                  onChange(newSettings);
                }}
              />
              <ObjectAttributeSelect
                objectAttributeId={settings.applicationObjectAttributeName || ""}
                objectTypeId={settings.applicationObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="Application Name"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = { ...settings, applicationObjectAttributeName: newObjectAttributeId };
                  onChange(newSettings);
                }}
              />
            </Inline>
          </YellowBox>
          <YellowBox title="Chargeback Account Asset">
            <ObjectTypeSelect
              objectTypeId={settings.chargebackAccountObjectTypeId || ""}
              objectSchemaId={settings.objectSchemaId || ""}
              workSpaceId={settings.workSpaceId || ""}
              label="Object type for Chargeback Accounts"
              onChange={(newObjectTypeId: string) => {
                const newSettings = { ...settings, chargebackAccountObjectTypeId: newObjectTypeId };
                onChange(newSettings);
              }}
            />
            <Inline alignInline="start" space="space.200">
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeName || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Name"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = { ...settings, chargebackAccountObjectAttributeName: newObjectAttributeId };
                  onChange(newSettings);
                }}
              />
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeChargeCC || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Charge CC"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = { ...settings, chargebackAccountObjectAttributeChargeCC: newObjectAttributeId };
                  onChange(newSettings);
                }}
              />
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeBusinessUnit || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Business Unit"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = {
                    ...settings,
                    chargebackAccountObjectAttributeBusinessUnit: newObjectAttributeId,
                  };
                  onChange(newSettings);
                }}
              />
            </Inline>
            <Inline alignInline="start" space="space.200">
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeTenant || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Tenant"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = { ...settings, chargebackAccountObjectAttributeTenant: newObjectAttributeId };
                  onChange(newSettings);
                }}
              />
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeOwner || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Owner"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = { ...settings, chargebackAccountObjectAttributeOwner: newObjectAttributeId };
                  onChange(newSettings);
                }}
              />
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeFinancialController || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Financial Controller"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = {
                    ...settings,
                    chargebackAccountObjectAttributeFinancialController: newObjectAttributeId,
                  };
                  onChange(newSettings);
                }}
              />
              <ObjectAttributeSelect
                objectAttributeId={settings.chargebackAccountObjectAttributeReportingUnit || ""}
                objectTypeId={settings.chargebackAccountObjectTypeId || ""}
                workSpaceId={settings.workSpaceId || ""}
                label="CB Account Reporting Unit"
                onChange={(newObjectAttributeId: string) => {
                  const newSettings = {
                    ...settings,
                    chargebackAccountObjectAttributeReportingUnit: newObjectAttributeId,
                  };
                  onChange(newSettings);
                }}
              />
            </Inline>
          </YellowBox>
          <YellowBox title="Vendor Asset">
            <ObjectTypeSelect
              objectTypeId={settings.vendorObjectTypeId || ""}
              objectSchemaId={settings.objectSchemaId || ""}
              workSpaceId={settings.workSpaceId || ""}
              label="Object type for Vendor"
              onChange={(newObjectTypeId: string) => {
                const newSettings = { ...settings, vendorObjectTypeId: newObjectTypeId };
                onChange(newSettings);
              }}
            />
          </YellowBox>
          <YellowBox title="Tenant Asset">
            <ObjectTypeSelect
              objectTypeId={settings.tenantObjectTypeId || ""}
              objectSchemaId={settings.objectSchemaId || ""}
              workSpaceId={settings.workSpaceId || ""}
              label="Object type for Tenant"
              onChange={(newObjectTypeId: string) => {
                const newSettings = { ...settings, tenantObjectTypeId: newObjectTypeId };
                onChange(newSettings);
              }}
            />
          </YellowBox>
          <Box xcss={{ width: "400px" }}>
            <Label labelFor="sharedCostsAccounts">Shared Costs Accounts (comma separated)</Label>
            <Textfield
              value={settings.sharedCostsAccounts || ""}
              id="sharedCostsAccounts"
              onChange={(e) => {
                const newSettings = { ...settings, sharedCostsAccounts: e.target.value };
                onChange(newSettings);
              }}
            />
          </Box>

          <Button onClick={saveSettings} appearance="primary">
            Save settings
          </Button>
        </>
      )}
    </Stack>
  );
};
