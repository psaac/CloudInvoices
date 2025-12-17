import React, { useState, useEffect } from "react";
import ForgeReconciler, {
  Box,
  Text,
  Inline,
  Stack,
  Button,
  Textfield,
  Label,
  Heading,
  SectionMessage,
} from "@forge/react";
import { invoke } from "@forge/bridge";
import { DefaultSettings, Settings, validSettings } from "../types";
import { SpaceSelect } from "./components/SpaceSelect";
import { WorkTypeSelect } from "./components/workTypeSelect";
import { WorkSpaceSelect } from "./components/workSpaceSelect";
import { ObjectSchemaSelect } from "./components/objectSchemaSelect";
import { ObjectTypeSelect } from "./components/objectTypeSelect";
import { ObjectAttributeSelect } from "./components/objectAttributeSelect";
import { YellowBox, BlueBox } from "./components/roundedbox";
import { FieldSelect } from "./components/FieldSelect";
import { RoleSelect } from "./components/RoleSelect";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(DefaultSettings);

  try {
    useEffect(() => {
      const fetchSettings = async () => {
        setLoading(true);
        try {
          const settingsData = await invoke<Settings>("getSettings", {});
          setSettings(settingsData);
        } catch (error) {
          console.error("Error fetching settings:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchSettings();
    }, []);

    const saveSettings = async () => {
      try {
        await invoke("setSettings", { settings });
      } catch (error) {
        console.error("Error saving settings:", error);
        alert("Error saving settings. Please try again.");
      }
    };

    return (
      <Box padding="space.400">
        <Heading size="medium">Chargeback Cloud - Admin - version {settings.appVersion}</Heading>
        <Stack alignInline="start" space="space.200" grow="fill">
          {loading && <Text>Loading...</Text>}
          {!loading && (
            <>
              <Inline alignInline="start" space="space.200">
                <SpaceSelect
                  spaceId={settings.spaceId}
                  onChange={(newSpaceId: string) => {
                    const newSettings = { ...settings, spaceId: newSpaceId };
                    setSettings(newSettings);
                  }}
                />
                <RoleSelect
                  spaceId={settings.spaceId}
                  roleId={settings.roleId}
                  onChange={(newRoleId: string) => {
                    const newSettings = { ...settings, roleId: newRoleId };
                    setSettings(newSettings);
                  }}
                  label="Role to access app"
                />
              </Inline>

              <BlueBox title="Source task work type">
                <WorkTypeSelect
                  label="Work type"
                  spaceId={settings.spaceId}
                  workTypeId={settings.taskWorkTypeId}
                  onChange={(newWorkTypeId: string) => {
                    const newSettings = { ...settings, taskWorkTypeId: newWorkTypeId };
                    setSettings(newSettings);
                  }}
                  subTaskType={false}
                />
                <Inline alignInline="start" space="space.200">
                  <FieldSelect
                    label="Field for batch id"
                    fieldId={settings.inputFieldBatchId}
                    spaceId={settings.spaceId}
                    onChange={(newFieldId: string) => {
                      const newSettings = { ...settings, inputFieldBatchId: newFieldId };
                      setSettings(newSettings);
                    }}
                  />
                  <FieldSelect
                    label="Field for billing month"
                    fieldId={settings.inputFieldBillingMonth}
                    spaceId={settings.spaceId}
                    onChange={(newFieldId: string) => {
                      const newSettings = { ...settings, inputFieldBillingMonth: newFieldId };
                      setSettings(newSettings);
                    }}
                  />
                  <FieldSelect
                    label="Field for Cloud Vendor"
                    fieldId={settings.inputFieldCloudVendor}
                    spaceId={settings.spaceId}
                    onChange={(newFieldId: string) => {
                      const newSettings = { ...settings, inputFieldCloudVendor: newFieldId };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </BlueBox>

              <BlueBox title="Target work type (storing Invoices & IDocs)">
                <Inline alignInline="start" space="space.200">
                  <WorkTypeSelect
                    label="Work type"
                    spaceId={settings.spaceId}
                    workTypeId={settings.targetWorkTypeId}
                    onChange={(newWorkTypeId: string) => {
                      const newSettings = { ...settings, targetWorkTypeId: newWorkTypeId };
                      setSettings(newSettings);
                    }}
                    subTaskType={false}
                  />
                  <WorkTypeSelect
                    label="Work type for Invoices (sub-task)"
                    spaceId={settings.spaceId}
                    workTypeId={settings.invoiceWorkTypeId}
                    onChange={(newWorkTypeId: string) => {
                      const newSettings = { ...settings, invoiceWorkTypeId: newWorkTypeId };
                      setSettings(newSettings);
                    }}
                    subTaskType={true}
                  />
                  <FieldSelect
                    label="Field for Chargeback Id"
                    fieldId={settings.inputFieldChargebackId}
                    spaceId={settings.spaceId}
                    onChange={(newFieldId: string) => {
                      const newSettings = { ...settings, inputFieldChargebackId: newFieldId };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </BlueBox>

              <Inline alignInline="start" space="space.200">
                <WorkSpaceSelect
                  workSpaceId={settings.workSpaceId}
                  onChange={(newWorkSpaceId: string) => {
                    const newSettings = { ...settings, workSpaceId: newWorkSpaceId };
                    setSettings(newSettings);
                  }}
                />
                <ObjectSchemaSelect
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  onChange={(newObjectSchemaId: string) => {
                    const newSettings = { ...settings, objectSchemaId: newObjectSchemaId };
                    setSettings(newSettings);
                  }}
                />
              </Inline>

              <YellowBox title="Application Asset">
                <ObjectTypeSelect
                  objectTypeId={settings.applicationObjectTypeId}
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  label="Object type for Applications"
                  onChange={(newObjectTypeId: string) => {
                    const newSettings = { ...settings, applicationObjectTypeId: newObjectTypeId };
                    setSettings(newSettings);
                  }}
                />
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.applicationObjectAttributeId}
                    objectTypeId={settings.applicationObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Application Id"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, applicationObjectAttributeId: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.applicationObjectAttributeName}
                    objectTypeId={settings.applicationObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Application Name"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, applicationObjectAttributeName: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.applicationObjectAttributeChargeback}
                    objectTypeId={settings.applicationObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Application Chargeback"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, applicationObjectAttributeChargeback: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.applicationObjectAttributeVendor}
                    objectTypeId={settings.applicationObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Application Vendor"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, applicationObjectAttributeVendor: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </YellowBox>
              <YellowBox title="Chargeback Account Asset">
                <ObjectTypeSelect
                  objectTypeId={settings.chargebackAccountObjectTypeId}
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  label="Object type for Chargeback Accounts"
                  onChange={(newObjectTypeId: string) => {
                    const newSettings = { ...settings, chargebackAccountObjectTypeId: newObjectTypeId };
                    setSettings(newSettings);
                  }}
                />
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeName}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Name"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeName: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeChargeCC}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Charge CC"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeChargeCC: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeChargeLE}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Charge LE"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeChargeLE: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeBusinessUnit}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Business Unit"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeBusinessUnit: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeTenant}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Tenant"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeTenant: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeOwner}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Owner"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeOwner: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeFinancialController}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Financial Controller"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeFinancialController: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeReportingUnit}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="CB Account Reporting Unit"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeReportingUnit: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeSAPAccount}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="SAP Account Override"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeSAPAccount: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </YellowBox>
              {/* <YellowBox title="Vendor Asset">
            <ObjectTypeSelect
              objectTypeId={settings.vendorObjectTypeId}
              objectSchemaId={settings.objectSchemaId}
              workSpaceId={settings.workSpaceId}
              label="Object type for Vendor"
              onChange={(newObjectTypeId: string) => {
                const newSettings = { ...settings, vendorObjectTypeId: newObjectTypeId };
                onChangeSettings(newSettings);
              }}
            />
          </YellowBox>
          <YellowBox title="Tenant Asset">
            <ObjectTypeSelect
              objectTypeId={settings.tenantObjectTypeId}
              objectSchemaId={settings.objectSchemaId}
              workSpaceId={settings.workSpaceId}
              label="Object type for Tenant"
              onChange={(newObjectTypeId: string) => {
                const newSettings = { ...settings, tenantObjectTypeId: newObjectTypeId };
                onChangeSettings(newSettings);
              }}
            />
          </YellowBox> */}
              <Inline alignInline="start" space="space.200">
                <Box>
                  <Label labelFor="sharedCostsAccounts">Shared Costs Accounts (comma separated)</Label>
                  <Textfield
                    value={settings.sharedCostsAccounts}
                    id="sharedCostsAccounts"
                    onChange={(e) => {
                      const newSettings = { ...settings, sharedCostsAccounts: e.target.value };
                      setSettings(newSettings);
                    }}
                  />
                </Box>
                <Box>
                  <Label labelFor="invoicePrefix">Invoice Prefix</Label>
                  <Textfield
                    value={settings.invoicePrefix}
                    id="invoicePrefix"
                    onChange={(e) => {
                      const newSettings = { ...settings, invoicePrefix: e.target.value };
                      setSettings(newSettings);
                    }}
                  />
                </Box>
              </Inline>
              <Inline alignInline="start" space="space.200">
                <Box xcss={{ width: "25%" }}>
                  <Label labelFor="defaultSAPAccount">Default SAP Account</Label>
                  <Textfield
                    value={settings.defaultSAPAccount}
                    id="defaultSAPAccount"
                    onChange={(e) => {
                      const newSettings = { ...settings, defaultSAPAccount: e.target.value };
                      setSettings(newSettings);
                    }}
                  />
                </Box>
                <Box xcss={{ width: "25%" }}>
                  <Label labelFor="defaultCostCenter">Default Cost Center</Label>
                  <Textfield
                    value={settings.defaultCostCenter}
                    id="defaultCostCenter"
                    onChange={(e) => {
                      const newSettings = { ...settings, defaultCostCenter: e.target.value };
                      setSettings(newSettings);
                    }}
                  />
                </Box>
                <Box xcss={{ width: "25%" }}>
                  <Label labelFor="defaultVendor">Default Vendor</Label>
                  <Textfield
                    value={settings.defaultVendor}
                    id="defaultVendor"
                    onChange={(e) => {
                      const newSettings = { ...settings, defaultVendor: e.target.value };
                      setSettings(newSettings);
                    }}
                  />
                </Box>
                <Box xcss={{ width: "25%" }}>
                  <Label labelFor="defaultChargeLE">Default Charge LE</Label>
                  <Textfield
                    value={settings.defaultChargeLE}
                    id="defaultChargeLE"
                    onChange={(e) => {
                      const newSettings = { ...settings, defaultChargeLE: e.target.value };
                      setSettings(newSettings);
                    }}
                  />
                </Box>
              </Inline>
              <Inline alignInline="start" space="space.200" alignBlock="center">
                <Button onClick={saveSettings} appearance="primary" isDisabled={loading || !validSettings(settings)}>
                  Save settings
                </Button>
                {!validSettings(settings) && (
                  <SectionMessage appearance="error">
                    <Text>Invalid settings.</Text>
                  </SectionMessage>
                )}
              </Inline>
            </>
          )}
        </Stack>
      </Box>
    );
  } catch (err) {
    console.error("App Error :", err);
    return <Text>An error occured.</Text>;
  }
};

try {
  ForgeReconciler.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error("Error rendering Forge :", e);
}
