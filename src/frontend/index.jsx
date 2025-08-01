import React, { useState, useContext } from "react";
import ForgeReconciler, { Text, Button, Stack, EmptyState } from "@forge/react";
import { invoke } from "@forge/bridge";
import { getLastMonths } from "./utils";
import Invoices from "./invoices";
import Loading from "./loading";
import SearchComponent from "./search";
import { GlobalProvider, GlobalContext } from "../frontend/globalcontext.jsx";
import { GenerateInvoicesConfirm } from "../frontend/generateInvoicesConfirm.jsx";

const App = () => {
  const { apiData, initApp } = useContext(GlobalContext);
  if (initApp) return <Text>Initializing app...</Text>;
  else if (apiData && !apiData.hasChargebackRole)
    return <EmptyState header="You don't have access to this app." />;
  try {
    const months = getLastMonths();
    const [selectedMonth, setSelectedMonth] = useState(months[0].value);

    // useEffect(() => {
    //   console.log("selectedMonth mis à jour :", selectedMonth);
    // }, [selectedMonth]);

    const [newInvoices, setNewInvoices] = useState([]);
    const [processedInvoices, setProcessedInvoices] = useState([]);
    const [assetErrorInvoices, setAssetErrorInvoices] = useState([]);

    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const validGenerateInvoices = () => {
      cancelGenerateInvoices();
      generateInvoices(false);
    };

    const cancelGenerateInvoices = () => setIsModalOpen(false);

    const handleSearch = async () => {
      setLoading(true);

      try {
        // New invoices
        setNewInvoices(
          await invoke("getNewInvoicesList", {
            yearMonth: selectedMonth,
            baseUrl: apiData.baseUrl,
          })
        );

        setProcessedInvoices(
          await invoke("getProcessedInvoicesList", {
            yearMonth: selectedMonth,
            baseUrl: apiData.baseUrl,
          })
        );

        // Asset error invoices
        setAssetErrorInvoices(
          await invoke("getAssetErrorInvoicesList", {
            yearMonth: selectedMonth,
            baseUrl: apiData.baseUrl,
          })
        );
      } catch (error) {
        console.error("JIRA API Error :", error);
      } finally {
        setLoading(false);
      }
    };

    const processInvoices = async () => {
      setLoading(true);
      try {
        // process all invoices that are in "new" state
        await invoke("processInvoices", {
          invoices: newInvoices,
        });

        // then reload data
        handleSearch();
      } catch (error) {
        console.error("JIRA API Error :", error);
      } finally {
        setLoading(false);
      }
    };

    const generateInvoices = async (warn = true) => {
      setLoading(true);
      try {
        // Ask user to confirm if there are Asset Error invoices
        if (warn && assetErrorInvoices.length > 0) {
          setIsModalOpen(true);
        } else {
          // Process invoices that are in "Asset OK" state
          await invoke("generateInvoices", {
            invoices: newInvoices,
          });
        }
      } catch (error) {
        console.error("JIRA API Error :", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <>
        <Stack alignInline="start" space="space.200">
          <SearchComponent
            months={months}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            handleSearch={handleSearch}
            loading={loading}
          />

          {loading && <Loading />}

          {!loading && newInvoices.length > 0 && (
            <>
              <Invoices
                invoices={newInvoices}
                title={`New invoices (${newInvoices.length})`}
              ></Invoices>
              <Button
                onClick={processInvoices}
                // isDisabled={loading || !selectedMonth}
              >
                Step 1 : Fill application accounts
              </Button>
            </>
          )}

          {!loading && assetErrorInvoices.length > 0 && (
            <>
              <Invoices
                invoices={assetErrorInvoices}
                title={`Asset Error invoices (${assetErrorInvoices.length})`}
                showAccountInfos={false}
              ></Invoices>
            </>
          )}

          {!loading && processedInvoices.length > 0 && (
            <>
              <Invoices
                invoices={processedInvoices}
                title={`Processed invoices (${processedInvoices.length})`}
              ></Invoices>
              <Button onClick={generateInvoices}>
                Step 2 : Generate invoices by Chargeback account
              </Button>
            </>
          )}
        </Stack>

        {/* {!loading && newInvoices.length === 0 && (
          <Text>No new invoices for this month.</Text>
        )} */}
        <GenerateInvoicesConfirm
          isOpen={isModalOpen}
          onCancel={cancelGenerateInvoices}
          onValid={validGenerateInvoices}
        />
      </>
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
