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
import { AssetSelect } from "./components/AssetSelect";

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
                </Inline>
                <Inline alignInline="start" space="space.200">
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
                  <FieldSelect
                    label="Field for emails to notify"
                    fieldId={settings.inputFieldEmailsToNotify}
                    spaceId={settings.spaceId}
                    onChange={(newFieldId: string) => {
                      const newSettings = { ...settings, inputFieldEmailsToNotify: newFieldId };
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

              <YellowBox title="Applications Assets">
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
              <YellowBox title="Chargeback Accounts Assets">
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
                    label="Account Name"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeName: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeChargeCC}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Cost Center"
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
                    label="Legal Entity"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeChargeLE: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeActive}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Active Flag"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeActive: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeTenant}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Tenant"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeTenant: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeOwner}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Owner"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = { ...settings, chargebackAccountObjectAttributeOwner: newObjectAttributeId };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeFinancialController}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Financial Controller"
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
                    label="Reporting Unit"
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
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeAdministrator}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Administrator"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeAdministrator: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeAlternativeAdministrators}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Alternate Administrator(s)"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeAlternativeAdministrators: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.chargebackAccountObjectAttributeAdditionalContacts}
                    objectTypeId={settings.chargebackAccountObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Additional Contacts"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        chargebackAccountObjectAttributeAdditionalContacts: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </YellowBox>
              <YellowBox title="Legal Entities Assets">
                <ObjectTypeSelect
                  objectTypeId={settings.legalEntitiesObjectTypeId}
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  label="Object type for Legal Entities"
                  onChange={(newObjectTypeId: string) => {
                    const newSettings = { ...settings, legalEntitiesObjectTypeId: newObjectTypeId };
                    setSettings(newSettings);
                  }}
                />
                <ObjectAttributeSelect
                  objectAttributeId={settings.legalEntityObjectAttributeName}
                  objectTypeId={settings.legalEntitiesObjectTypeId}
                  workSpaceId={settings.workSpaceId}
                  label="Name Attribute"
                  onChange={(newObjectAttributeId: string) => {
                    const newSettings = {
                      ...settings,
                      legalEntityObjectAttributeName: newObjectAttributeId,
                    };
                    setSettings(newSettings);
                  }}
                />
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.legalEntityObjectAttributeCode}
                    objectTypeId={settings.legalEntitiesObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Code Attribute"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        legalEntityObjectAttributeCode: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.legalEntityObjectAttributeSystem}
                    objectTypeId={settings.legalEntitiesObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="System Attribute"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        legalEntityObjectAttributeSystem: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </YellowBox>

              <YellowBox title="Reporting Units Assets">
                <ObjectTypeSelect
                  objectTypeId={settings.reportingUnitObjectTypeId}
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  label="Object type for Reporting Units"
                  onChange={(newObjectTypeId: string) => {
                    const newSettings = { ...settings, reportingUnitObjectTypeId: newObjectTypeId };
                    setSettings(newSettings);
                  }}
                />
                <Inline alignInline="start" space="space.200">
                  <ObjectAttributeSelect
                    objectAttributeId={settings.reportingUnitObjectAttributeName}
                    objectTypeId={settings.reportingUnitObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Name Attribute"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        reportingUnitObjectAttributeName: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.reportingUnitObjectAttributeCode}
                    objectTypeId={settings.reportingUnitObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Code Attribute"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        reportingUnitObjectAttributeCode: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.reportingUnitObjectAttributeAddress}
                    objectTypeId={settings.reportingUnitObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Address Attribute"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        reportingUnitObjectAttributeAddress: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                  <ObjectAttributeSelect
                    objectAttributeId={settings.reportingUnitObjectAttributeCountry}
                    objectTypeId={settings.reportingUnitObjectTypeId}
                    workSpaceId={settings.workSpaceId}
                    label="Country Attribute"
                    onChange={(newObjectAttributeId: string) => {
                      const newSettings = {
                        ...settings,
                        reportingUnitObjectAttributeCountry: newObjectAttributeId,
                      };
                      setSettings(newSettings);
                    }}
                  />
                </Inline>
              </YellowBox>
              <YellowBox title="Cost Center Assets">
                <ObjectTypeSelect
                  objectTypeId={settings.costCenterObjectTypeId}
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  label="Object type for cost centers"
                  onChange={(newObjectTypeId: string) => {
                    const newSettings = { ...settings, costCenterObjectTypeId: newObjectTypeId };
                    setSettings(newSettings);
                  }}
                />
                <ObjectAttributeSelect
                  objectAttributeId={settings.costCenterObjectAttributeCode}
                  objectTypeId={settings.costCenterObjectTypeId}
                  workSpaceId={settings.workSpaceId}
                  label="Code Attribute"
                  onChange={(newObjectAttributeId: string) => {
                    const newSettings = {
                      ...settings,
                      costCenterObjectAttributeCode: newObjectAttributeId,
                    };
                    setSettings(newSettings);
                  }}
                />
              </YellowBox>
              <YellowBox title="Employees/Contractors Assets">
                <ObjectTypeSelect
                  objectTypeId={settings.peopleObjectTypeId}
                  objectSchemaId={settings.objectSchemaId}
                  workSpaceId={settings.workSpaceId}
                  label="Object type for contacts (Owner, Finance Controller, Admin...), must match the asset object type of these attributes"
                  onChange={(newObjectTypeId: string) => {
                    const newSettings = { ...settings, peopleObjectTypeId: newObjectTypeId };
                    setSettings(newSettings);
                  }}
                />
                <ObjectAttributeSelect
                  objectAttributeId={settings.peopleObjectAttributeEmail}
                  objectTypeId={settings.peopleObjectTypeId}
                  workSpaceId={settings.workSpaceId}
                  label="Email Attribute"
                  onChange={(newObjectAttributeId: string) => {
                    const newSettings = {
                      ...settings,
                      peopleObjectAttributeEmail: newObjectAttributeId,
                    };
                    setSettings(newSettings);
                  }}
                />
              </YellowBox>
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
              </Inline>
              <Inline alignInline="start" space="space.200">
                <AssetSelect
                  label="Remit To Asset"
                  workSpaceId={settings.workSpaceId}
                  objectTypeId={settings.reportingUnitObjectTypeId}
                  assetId={settings.remitToAssetId}
                  onChange={(newAssetId: string) => {
                    const newSettings = { ...settings, remitToAssetId: newAssetId };
                    setSettings(newSettings);
                  }}
                />

                <AssetSelect
                  label="Default Legal Entity Asset"
                  workSpaceId={settings.workSpaceId}
                  objectTypeId={settings.legalEntitiesObjectTypeId}
                  assetId={settings.defaultLegalEntityId}
                  onChange={(newAssetId: string) => {
                    const newSettings = { ...settings, defaultLegalEntityId: newAssetId };
                    setSettings(newSettings);
                  }}
                />

                <Box>
                  <Label labelFor="minimumChargebackAmount">Minimum Chargeback Amount</Label>
                  <Textfield
                    value={settings.minimumChargebackAmount}
                    id="minimumChargebackAmount"
                    type="number"
                    onChange={(e) => {
                      const newSettings = { ...settings, minimumChargebackAmount: Number(e.target.value) };
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
    </React.StrictMode>,
  );
} catch (e) {
  console.error("Error rendering Forge :", e);
}
