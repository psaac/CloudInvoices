import React, { useState, useEffect, useContext } from "react";
import ForgeReconciler, {
  Box,
  Text,
  EmptyState,
  Stack,
  Inline,
  Heading,
  Button,
  Label,
  Textfield,
  SectionMessage,
  ProgressBar,
  RequiredAsterisk,
  Spinner,
  Popup,
} from "@forge/react";
import { GlobalProvider, GlobalContext, GlobalContextType } from "./globalcontext";
import { invoke } from "@forge/bridge";
import { DefaultSettings, AssetsAndAttrs, Task, validSettings } from "../types";
import { CloudDataTable } from "./components/TableCloudData";
import { CloudData, CloudVendor } from "../backend/CloudData";
import { UserInput } from "../backend/UserInput";
import { allVendorsSelected } from "./Graphics";
import { loadTasks, fillApplicationAccounts } from "./FillApplicationAccounts";
import { TableTasks } from "./components/TableTasks";
import { TableInvoices } from "./components/TableInvoices";
import { Invoices, Invoice, generateInvoicesAndIDFiles } from "./Invoices";
import { InvoiceLine } from "../backend/InvoiceLine";
import { generateDBT } from "./DBT";
import { InvoiceLinesTable } from "./components/TableInvoiceLines";

enum CurrentStep {
  None = 0,
  DataFetched = 1,
  AssetsFilled = 2,
  DBTComputed = 3,
  InvoicesGenerated = 4,
}

const App = () => {
  const globalContext: GlobalContextType | null = useContext(GlobalContext);
  const [currentStep, setCurrentStep] = useState<CurrentStep>(CurrentStep.None);
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
  const [invoiceLinesData, setInvoiceLinesData] = useState<Array<InvoiceLine>>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number>(-1);
  const [progressIndeterminate, setProgressIndeterminate] = useState(true);
  const [progressSuccess, setProgressSuccess] = useState<"default" | "success">("default");
  const [currentProgressText, setCurrentProgressText] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

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

  const initProgress = (text: string) => {
    updateProgress(0);
    setCurrentProgressText(text);
  };

  const updateProgress = (progress: number, message?: string) => {
    setLoading(progress >= 0 && progress <= 1);
    setProgressIndeterminate(progress === 0);
    setProgressSuccess(progress === 2 ? "success" : "default");
    setProgress(progress);
    if (message) setCurrentProgressText(message);

    if (progress === 2) {
      setCurrentProgressText("Completed.");
      const timer = setTimeout(() => {
        setProgress(-1);
        timer && clearTimeout(timer);
      }, 3000);
    }
  };

  const fetchCloudDataAndVendors = async () => {
    initProgress("Fetching cloud data and vendors...");
    try {
      setCloudData([]);
      const fetchedCloudData = await invoke<Array<CloudData>>("getCloudDataByBillingMonth", {
        billingMonth: userInput.billingMonth,
        settings: globalContext?.apiData.settings,
        baseUrl: globalContext?.apiData.serverInfos.baseUrl,
      });
      setCloudData(fetchedCloudData);
      setSelectedCloudData([]);

      const vendorsData = await invoke<Array<CloudVendor>>("getCloudVendors", {
        settings: globalContext?.apiData.settings,
      });
      setCloudVendors(vendorsData);

      // Fetch any existing invoices for the billing month
      const existingInvoiceLines = await invoke<Array<InvoiceLine>>("getInvoiceLinesByBillingMonth", {
        billingMonth: userInput.billingMonth,
        settings: globalContext?.apiData.settings,
        baseUrl: globalContext?.apiData.serverInfos.baseUrl,
      });
      setInvoiceLinesData(existingInvoiceLines);

      setCurrentStep(CurrentStep.DataFetched);
      updateProgress(2);
    } catch (error) {
      console.error("JIRA API Error :", error);
    }
  };

  const fetchAssetsAndFillApplicationAccounts = async () => {
    initProgress("Loading assets...");
    setTaskErrors([]);
    try {
      const fetchedChargebackAssets = await invoke<AssetsAndAttrs>("loadChargebackAssets", {
        settings: globalContext?.apiData.settings,
      });

      const fetchedApplicationAssets = await invoke<AssetsAndAttrs>("loadApplicationAssets", {
        settings: globalContext?.apiData.settings,
      });

      const totalSteps = selectedCloudData.length + 1;
      updateProgress(1 / totalSteps);

      // For all selected cloud data, fill application and chargeback accounts
      const tasks: Array<Task> = [];
      let index = 1;
      for (const cloudDataItem of selectedCloudData) {
        setCurrentProgressText(`Filling accounts for ${cloudDataItem.CloudVendor.value}...`);
        tasks.push(...(await loadTasks(cloudDataItem)));
        index++;
        updateProgress(index / totalSteps);
      }

      const result = fillApplicationAccounts({
        billingMonth: userInput.billingMonth,
        applicationAssets: fetchedApplicationAssets,
        chargebackAssets: fetchedChargebackAssets,
        tasks,
        settings: globalContext?.apiData.settings ?? DefaultSettings,
      });
      setInvoices(result.result);
      setTaskErrors(result.taskErrors);

      setCurrentStep(CurrentStep.AssetsFilled);
      updateProgress(2);
    } catch (error) {
      console.error("JIRA API Error :", error);
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

  try {
    if (globalContext?.initApp)
      return (
        <Box padding="space.400">
          <Stack alignBlock="center" spread="space-between">
            <Inline space="space.200" alignInline="center" alignBlock="center">
              <Box>
                <Spinner />
              </Box>
              <Box>
                <Text>Initializing app...</Text>
              </Box>
            </Inline>
          </Stack>
        </Box>
      );
    else if (globalContext?.apiData && !globalContext?.apiData.hasChargebackRole)
      return <EmptyState header="You don't have access to this app." />;
    else if (!validSettings(globalContext?.apiData.settings ?? DefaultSettings))
      return <EmptyState header="Settings are not configured properly." />;

    return (
      <Box padding="space.400">
        <Heading size="medium">Chargeback Cloud - version {globalContext?.apiData.settings.appVersion}</Heading>
        <Inline spread="space-between">
          <Box padding="space.100">
            <Inline alignBlock="end">
              <Box padding="space.100">
                <Label labelFor="billingMonth">
                  Billing Month <RequiredAsterisk />
                </Label>
                <Textfield
                  id="billingMonth"
                  value={userInput.billingMonth}
                  onChange={(e) => setUserInput({ ...userInput, billingMonth: e.target.value })}
                  isDisabled={loading}
                  isRequired
                />
              </Box>
              <Box padding="space.100">
                <Label labelFor="sharedSecurityCost">
                  Shared Security Cost <RequiredAsterisk />
                </Label>
                <Textfield
                  id="sharedSecurityCost"
                  value={userInput.sharedSecurityCost}
                  onChange={(e) => setUserInput({ ...userInput, sharedSecurityCost: e.target.value })}
                  isDisabled={loading}
                  isRequired
                />
              </Box>
              {currentStep === CurrentStep.DataFetched && !allVendorsSelected(selectedCloudData, cloudVendors) && (
                <SectionMessage appearance="warning">
                  <Text>Select all vendors, once.</Text>
                </SectionMessage>
              )}
            </Inline>

            <Inline spread="space-between">
              <Box padding="space.100">
                <Button
                  appearance="primary"
                  onClick={() => fetchCloudDataAndVendors()}
                  isDisabled={loading || !userInput.billingMonth || userInput.billingMonth.trim() === ""}
                >
                  1 Fetch data
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
                  2 Fill application/chargeback accounts
                </Button>
              </Box>
              <Box padding="space.100">
                <Button
                  appearance="primary"
                  onClick={() => {
                    initProgress("Computing DBT...");
                    try {
                      const processedInvoices = generateDBT(
                        globalContext?.apiData.settings ?? DefaultSettings,
                        invoices,
                        userInput.sharedSecurityCost ?? 0
                      );
                      setInvoices(processedInvoices);

                      setCurrentStep(CurrentStep.DBTComputed);
                      updateProgress(2);
                    } catch (error) {
                      console.error("JIRA API Error :", error);
                    }
                  }}
                  isDisabled={loading || invoices.Invoices.size === 0 || currentStep < CurrentStep.AssetsFilled}
                >
                  3 Compute DBT
                </Button>
              </Box>
              <Box padding="space.100">
                <Button
                  appearance="primary"
                  onClick={async () => {
                    initProgress("Generating invoices & IDocs files...");
                    try {
                      const invoiceLines = await generateInvoicesAndIDFiles({
                        settings: globalContext?.apiData.settings ?? DefaultSettings,
                        invoices,
                        baseUrl: globalContext?.apiData.serverInfos.baseUrl ?? "",
                        updateProgress,
                      });
                      setCurrentStep(CurrentStep.InvoicesGenerated);
                      updateProgress(2);
                      setInvoiceLinesData(invoiceLines);
                    } catch (error) {
                      console.error("JIRA API Error :", error);
                    }
                  }}
                  isDisabled={loading || invoices.Invoices.size === 0 || currentStep < CurrentStep.DBTComputed}
                >
                  4 Generate invoices & IDocs files
                </Button>
              </Box>
              <Box padding="space.100">
                <Popup
                  isOpen={popupOpen}
                  onClose={() => setPopupOpen(false)}
                  placement="bottom-start"
                  content={() => <Box xcss={{ padding: "space.200" }}>Not implemented yet.</Box>}
                  trigger={() => (
                    <Button
                      appearance="primary"
                      onClick={async () => {
                        initProgress("Sending invoices & IDocs files...");
                        try {
                          /*
                      await sendInvoicesAndIDFiles({
                        settings: globalContext?.apiData.settings ?? DefaultSettings,
                        invoices,
                        updateProgress,
                      });
                      */

                          updateProgress(2);
                        } catch (error) {
                          console.error("JIRA API Error :", error);
                        }
                      }}
                      isDisabled={
                        loading || invoices.Invoices.size === 0 || currentStep < CurrentStep.InvoicesGenerated
                      }
                    >
                      5 Send invoices & IDocs files
                    </Button>
                  )}
                />
              </Box>
            </Inline>
            <Inline>
              <Box padding="space.100" xcss={{ width: "100%" }}>
                {progress >= 0 && (
                  <>
                    <Text>{currentProgressText}</Text>
                    <ProgressBar
                      value={progress}
                      ariaLabel={currentProgressText}
                      isIndeterminate={progressIndeterminate}
                      appearance={progressSuccess}
                    />
                  </>
                )}
              </Box>
            </Inline>

            <Box padding="space.100">
              {currentStep === CurrentStep.DataFetched && (
                <CloudDataTable data={cloudData} onSelect={onSelectCloudData} disabled={loading} />
              )}
              {currentStep === CurrentStep.AssetsFilled && taskErrors.length > 0 && (
                <TableTasks taskList={taskErrors} title="Task Errors" />
              )}
              {currentStep === CurrentStep.AssetsFilled && (
                <SectionMessage appearance="success">
                  <Text>All Application Accounts Filled without errors.</Text>
                </SectionMessage>
              )}
              {currentStep === CurrentStep.DBTComputed && <TableInvoices invoices={invoices} />}
              {(currentStep === CurrentStep.InvoicesGenerated || currentStep === CurrentStep.DataFetched) &&
                invoiceLinesData.length > 0 && <InvoiceLinesTable data={invoiceLinesData} />}
            </Box>
          </Box>
        </Inline>
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
      <GlobalProvider>
        <App />
      </GlobalProvider>
    </React.StrictMode>
  );
} catch (e) {
  console.error("Error rendering Forge :", e);
}
