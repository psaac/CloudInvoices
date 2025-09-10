import React, { useState, useContext, useEffect } from "react";
import ForgeReconciler, { Text, Button, Stack, EmptyState } from "@forge/react";
import { invoke } from "@forge/bridge";
import { Month, getLastMonths } from "./utils";
import ChargebackInList, { ShowAccountInfos } from "./chargeback";
import Loading from "./loading";
import SearchComponent from "./search";
import { GlobalProvider, GlobalContext, GlobalContextType } from "./globalcontext";
import { GenerateChargebackOutConfirm } from "./generateChargebackOutConfirm";
import { ChargebackIn } from "../backend/chargeback";

const App = () => {
  const globalContext: GlobalContextType | null = useContext(GlobalContext);
  if (globalContext?.initApp) return <Text>Initializing app...</Text>;
  else if (globalContext?.apiData && !globalContext?.apiData.hasChargebackRole)
    return <EmptyState header="You don't have access to this app." />;
  try {
    const months: Month[] = getLastMonths();
    const [selectedMonth, setSelectedMonth] = useState<string>(months[0]?.value ?? "");

    useEffect(() => {
      console.log("selectedMonth mis à jour :", selectedMonth);
    }, [selectedMonth]);

    const [newChargebackIn, setNewChargebackIn] = useState<ChargebackIn[]>([]);
    const [processedChargebackIn, setProcessedChargebackIn] = useState<ChargebackIn[]>([]);
    const [assetErrorChargebackIn, setAssetErrorChargebackIn] = useState<ChargebackIn[]>([]);
    const [newChargebackOutList, setNewChargebackOutList] = useState<ChargebackIn[]>([]);
    const [inProgressChargebackOutList, setInProgressChargebackOutList] = useState<ChargebackIn[]>([]);
    const [doneChargebackOutList, setDoneChargebackOutList] = useState<ChargebackIn[]>([]);

    const [firstActionHasBeenTriggered, setFirstActionHasBeenTriggered] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const validGenerateChargebackOut = () => {
      cancelGenerateChargebackOut();
      generateChargebackOut({ warn: false });
    };

    const cancelGenerateChargebackOut = () => setIsModalOpen(false);

    const handleSearch = async ({ delay = 0 }: { delay?: number }) => {
      setFirstActionHasBeenTriggered(true);

      setNewChargebackIn([]);
      setProcessedChargebackIn([]);
      setAssetErrorChargebackIn([]);
      setNewChargebackOutList([]);
      setInProgressChargebackOutList([]);
      setDoneChargebackOutList([]);

      const isLoading = loading;
      if (!isLoading) setLoading(true);

      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        const [
          newChargebackIn,
          processedChargebackIn,
          assetErrorChargebackIn,
          newChargebackOut,
          inProgressChargebackOut,
          doneChargebackOut,
        ] = await Promise.all([
          invoke("getNewChargebackInList", {
            billingMonth: selectedMonth,
            baseUrl: globalContext?.apiData.baseUrl,
          }),
          invoke("getProcessedChargebackInList", {
            billingMonth: selectedMonth,
            baseUrl: globalContext?.apiData.baseUrl,
          }),
          invoke("getAssetErrorChargebackInList", {
            billingMonth: selectedMonth,
            baseUrl: globalContext?.apiData.baseUrl,
          }),
          invoke("getNewChargebackOutList", {
            billingMonth: selectedMonth,
            baseUrl: globalContext?.apiData.baseUrl,
          }),
          invoke("getInProgressChargebackOutList", {
            billingMonth: selectedMonth,
            baseUrl: globalContext?.apiData.baseUrl,
          }),
          invoke("getDoneChargebackOutList", {
            billingMonth: selectedMonth,
            baseUrl: globalContext?.apiData.baseUrl,
          }),
        ]);

        // Mise à jour des states
        setNewChargebackIn(newChargebackIn as ChargebackIn[]);
        setProcessedChargebackIn(processedChargebackIn as ChargebackIn[]);
        setAssetErrorChargebackIn(assetErrorChargebackIn as ChargebackIn[]);
        setNewChargebackOutList(newChargebackOut as ChargebackIn[]);
        setInProgressChargebackOutList(inProgressChargebackOut as ChargebackIn[]);
        setDoneChargebackOutList(doneChargebackOut as ChargebackIn[]);
      } catch (error) {
        console.error("JIRA API Error :", error);
      } finally {
        if (!isLoading) setLoading(false);
      }
    };

    const processChargebackIn = async () => {
      setLoading(true);
      try {
        // process all ChargebackIn that are in "new" state
        await invoke("processChargebackIn", {
          chargebackInList: newChargebackIn,
        });

        // then reload data
        await handleSearch({ delay: 1000 });
      } catch (error) {
        console.error("JIRA API Error :", error);
      } finally {
        setLoading(false);
      }
    };

    const generateChargebackOut = async ({ warn = true }: { warn?: boolean }) => {
      // Ask user to confirm if there are Asset Error
      if (warn && assetErrorChargebackIn.length > 0) {
        setIsModalOpen(true);
      } else {
        setLoading(true);
        try {
          // Process ChargebackIn that are in "Asset OK" state
          await invoke("generateChargebackOut", {
            billingMonth: selectedMonth,
            startIndex: 0,
          });

          await handleSearch({ delay: 1000 });
        } catch (error) {
          console.error("JIRA API Error :", error);
        } finally {
          setLoading(false);
        }
      }
    };

    const updateChargebackGroupOutCost = async () => {
      setLoading(true);
      try {
        await invoke("updateChargebackGroupOutCost");
        await invoke("updateChargebackOutCost", { billingMonth: selectedMonth });

        await handleSearch({ delay: 1000 });
      } catch (error) {
        console.error("JIRA API Error :", error);
      } finally {
        setLoading(false);
      }
    };

    const generateInvoices = async () => {
      setLoading(true);
      try {
        await invoke("generateInvoices", { billingMonth: selectedMonth });

        await handleSearch({ delay: 1000 });
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
            handleSearch={() => handleSearch({})}
            loading={loading}
          />

          {firstActionHasBeenTriggered && (
            <>
              {loading && <Loading />}

              {!loading && newChargebackIn.length > 0 && (
                <>
                  <ChargebackInList
                    chargebackInList={newChargebackIn}
                    title={`New ChargebackIn (${newChargebackIn.length})`}
                  ></ChargebackInList>
                  <Button onClick={() => processChargebackIn()} isDisabled={loading || !selectedMonth}>
                    Step 1 : Fill application accounts
                  </Button>
                </>
              )}

              {!loading && newChargebackIn.length === 0 && <Text>No new chargeback in for this month.</Text>}

              {!loading && assetErrorChargebackIn.length > 0 && (
                <>
                  <ChargebackInList
                    chargebackInList={assetErrorChargebackIn}
                    title={`Asset Error ChargebackIn (${assetErrorChargebackIn.length})`}
                    showAccountInfos={ShowAccountInfos.None}
                  ></ChargebackInList>
                </>
              )}

              {!loading && processedChargebackIn.length > 0 && (
                <>
                  <ChargebackInList
                    chargebackInList={processedChargebackIn}
                    title={`Linked ChargebackIn to Chargeback accounts (${processedChargebackIn.length})`}
                  ></ChargebackInList>
                  <Button onClick={() => generateChargebackOut({})} isDisabled={loading || !selectedMonth}>
                    Step 2 : Generate chargeback out by Chargeback account
                  </Button>
                </>
              )}
              {!loading && newChargebackOutList.length > 0 && (
                <>
                  <ChargebackInList
                    chargebackInList={newChargebackOutList}
                    title={`Chargeback out to update (${newChargebackOutList.length})`}
                    showAccountInfos={ShowAccountInfos.ChargebackOnly}
                  ></ChargebackInList>
                  <Button onClick={() => updateChargebackGroupOutCost()} isDisabled={loading || !selectedMonth}>
                    Step 3 : Validate chargeback out
                  </Button>
                </>
              )}

              {!loading && inProgressChargebackOutList.length > 0 && (
                <>
                  <ChargebackInList
                    chargebackInList={inProgressChargebackOutList}
                    title={`Chargeback out to process (${inProgressChargebackOutList.length})`}
                    showAccountInfos={ShowAccountInfos.ChargebackOnly}
                  ></ChargebackInList>
                  <Button onClick={() => generateInvoices()} isDisabled={loading || !selectedMonth}>
                    Step 4 : Generate Invoices
                  </Button>
                </>
              )}

              {!loading && doneChargebackOutList.length > 0 && (
                <>
                  <ChargebackInList
                    chargebackInList={doneChargebackOutList}
                    title={`Done Chargeback out (${doneChargebackOutList.length})`}
                    showAccountInfos={ShowAccountInfos.ChargebackOnly}
                  ></ChargebackInList>
                </>
              )}
            </>
          )}
        </Stack>

        <GenerateChargebackOutConfirm
          isOpen={isModalOpen}
          onCancel={cancelGenerateChargebackOut}
          onValid={validGenerateChargebackOut}
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
