import React, { useState, useEffect } from "react";
import { Box, Button, Inline, Label, Textfield, SectionMessage, Text, ProgressBar } from "@forge/react";
import { invoke } from "@forge/bridge";
import { CloudDataTable } from "./components/TableCloudData";
import { Settings, AssetsAndAttrs, Task } from "../types";
import Loading from "./components/loading";
import { CloudData, CloudVendor } from "../backend/CloudData";
import { UserInput } from "../backend/UserInput";
import { allVendorsSelected } from "./utils";
import { loadTasks, fillApplicationAccounts } from "./FillApplicationAccounts";
import { TableTasks } from "./components/TableTasks";
import { TableInvoices } from "./components/TableInvoices";
import { Invoices, Invoice } from "./Invoices";
import { generateDBT } from "./DBT";

enum CurrentStep {
  None = 0,
  DataFetched = 1,
  AssetsFilled = 2,
  DBTComputed = 3,
}

export const MainTab = ({ settings, baseUrl }: { settings: Settings; baseUrl: string }) => {
  const [currentStep, setCurrentStep] = useState<CurrentStep>(CurrentStep.None);
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<UserInput>(new UserInput(""));
  const [cloudVendors, setCloudVendors] = useState<Array<CloudVendor>>([]);
  const [cloudData, setCloudData] = useState<Array<CloudData>>([]);
  const [selectedCloudData, setSelectedCloudData] = useState<Array<CloudData>>([]);
  const [invoices, setInvoices] = useState<Invoices>({
    BillingMonth: "",
    TotalAmount: 0,
    NetworkSharedCosts: 0,
    TotalByVendor: new Map<string, number>(), // Key is Vendor Name
    Invoices: new Map<string, Invoice>(),
  });
  const [taskErrors, setTaskErrors] = useState<Array<Task>>([]);
  const [progress, setProgress] = useState<number>(-1);
  const [currentProgressText, setCurrentProgressText] = useState<string>("");

  useEffect(() => {
    const fetchUserInput = async () => {
      try {
        setUserInput(await invoke("getUserInput"));
      } catch (e) {
        console.error("Error parsing cookie :", e);
      }
    };
    fetchUserInput();
  }, []);

  // Debounce save user input
  useEffect(() => {
    const saveUserInput = async (userInput: UserInput) => {
      try {
        await invoke("setUserInput", { userInput });
      } catch (error) {
        console.error("Error saving user input:", error);
      }
    };

    const timer = setTimeout(() => {
      if (userInput) {
        saveUserInput(userInput);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [userInput]);

  const fetchCloudDataAndVendors = async () => {
    setLoading(true);
    try {
      setCloudData([]);
      const fetchedCloudData = await invoke<Array<CloudData>>("getCloudDataByBillingMonth", {
        billingMonth: userInput.billingMonth,
        settings,
        baseUrl,
      });
      setCloudData(fetchedCloudData);
      setSelectedCloudData([]);

      const vendorsData = await invoke<Array<CloudVendor>>("getCloudVendors", {
        settings,
      });
      setCloudVendors(vendorsData);

      setCurrentStep(CurrentStep.DataFetched);
    } catch (error) {
      console.error("JIRA API Error :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetsAndFillApplicationAccounts = async () => {
    setProgress(0);
    setCurrentProgressText("Loading assets...");
    setTaskErrors([]);
    setLoading(true);
    try {
      const fetchedChargebackAssets = await invoke<AssetsAndAttrs>("loadChargebackAssets", {
        settings,
      });

      const fetchedApplicationAssets = await invoke<AssetsAndAttrs>("loadApplicationAssets", {
        settings,
      });

      const totalSteps = selectedCloudData.length + 1;
      setProgress(1 / totalSteps);

      // For all selected cloud data, fill application and chargeback accounts
      const tasks: Array<Task> = [];
      let index = 1;
      for (const cloudDataItem of selectedCloudData) {
        setCurrentProgressText(`Filling accounts for ${cloudDataItem.CloudVendor.value}...`);
        tasks.push(...(await loadTasks(cloudDataItem)));
        index++;
        setProgress(index / totalSteps);
      }

      const result = fillApplicationAccounts({
        billingMonth: userInput.billingMonth,
        applicationAssets: fetchedApplicationAssets,
        chargebackAssets: fetchedChargebackAssets,
        tasks,
        settings,
      });
      setInvoices(result.result);
      setTaskErrors(result.taskErrors);

      setCurrentStep(CurrentStep.AssetsFilled);
    } catch (error) {
      console.error("JIRA API Error :", error);
    } finally {
      setLoading(false);
      setProgress(1);
    }
  };

  const computeDBT = async () => {
    setLoading(true);
    try {
      /*
      logInfo(`Grand Total : ${invoices.TotalAmount}`);
    logInfo(`Total by vendor : ${Array.from(invoices.TotalByVendor.entries())}`);
    logInfo(`Shared costs : ${Array.from(sharedCostsByVendor.entries())}`);

    // Check that all shared costs have been allocated
      logInfo(
        `Shared Network cost for vendor ${sharedCost} : ${sharedCost} allocated : ${allocatedNetworkCost} difference : ${round2(
          sharedCost - allocatedNetworkCost
        )}`
      );

      // Check that all shared costs have been allocated (Possible rounding issues)
      logInfo(
            `Shared Security costs : ${allocatedSecurityCost} difference : ${round2(
              this.cloudSecurityTotalCost - allocatedSecurityCost
            )}`
          );
    */
      const processedInvoices = generateDBT(settings, invoices, userInput.sharedSecurityCost);
      setInvoices(processedInvoices);

      setCurrentStep(CurrentStep.DBTComputed);
    } catch (error) {
      console.error("JIRA API Error :", error);
    } finally {
      setLoading(false);
    }
  };

  const onSelectCloudData = (cloudData: CloudData, selected: boolean) => {
    let updatedSelectedCloudData = [...selectedCloudData];
    if (selected) {
      // Add to selected
      updatedSelectedCloudData.push(cloudData);
    } else {
      // Remove from selected
      updatedSelectedCloudData = updatedSelectedCloudData.filter((item) => item.Key !== cloudData.Key);
    }
    setSelectedCloudData(updatedSelectedCloudData);
  };

  return (
    <>
      <Inline alignBlock="end">
        <Box padding="space.100">
          <Label labelFor="billingMonth">Billing Month</Label>
          <Textfield
            id="billingMonth"
            value={userInput.billingMonth}
            onChange={(e) => setUserInput({ ...userInput, billingMonth: e.target.value })}
            isDisabled={loading}
          />
        </Box>
        {currentStep === CurrentStep.DataFetched && !allVendorsSelected(selectedCloudData, cloudVendors) && (
          <SectionMessage appearance="warning">
            <Text>Select all vendors, once.</Text>
          </SectionMessage>
        )}
        {loading && <Loading />}
      </Inline>

      <Inline>
        <Box padding="space.100">
          <Button
            appearance="primary"
            onClick={() => fetchCloudDataAndVendors()}
            isDisabled={loading || !userInput.billingMonth || userInput.billingMonth.trim() === ""}
          >
            Step 1 : Fetch data
          </Button>
        </Box>
        <Box padding="space.100">
          <Button
            appearance="primary"
            onClick={() => fetchAssetsAndFillApplicationAccounts()}
            isDisabled={
              loading ||
              selectedCloudData.length === 0 ||
              currentStep < CurrentStep.DataFetched ||
              !allVendorsSelected(selectedCloudData, cloudVendors)
            }
          >
            Step 2 : Fill application/chargeback accounts
          </Button>
        </Box>
        <Box padding="space.100">
          <Button
            appearance="primary"
            onClick={() => computeDBT()}
            isDisabled={loading || invoices.Invoices.size === 0 || currentStep < CurrentStep.AssetsFilled}
          >
            Step 3 : Compute DBT
          </Button>
        </Box>
      </Inline>
      {progress >= 0 && (
        <Box padding="space.100">
          <ProgressBar value={progress} ariaLabel={currentProgressText} />
        </Box>
      )}

      <Box padding="space.100">
        {currentStep === CurrentStep.DataFetched && <CloudDataTable data={cloudData} onSelect={onSelectCloudData} />}
        {currentStep === CurrentStep.AssetsFilled && taskErrors.length > 0 && (
          <TableTasks taskList={taskErrors} title="Task Errors" />
        )}
        {currentStep === CurrentStep.AssetsFilled && (
          <SectionMessage appearance="success">
            <Text>All Application Accounts Filled without errors.</Text>
          </SectionMessage>
        )}
        {currentStep === CurrentStep.DBTComputed && <TableInvoices invoices={invoices} />}
      </Box>
    </>
  );
};
