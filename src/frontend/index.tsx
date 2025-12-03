import React, { useContext, useState, useEffect } from "react";
import ForgeReconciler, { Box, Text, EmptyState, Tabs, TabList, Tab, TabPanel } from "@forge/react";
import { GlobalProvider, GlobalContext, GlobalContextType } from "./globalcontext";
import { invoke } from "@forge/bridge";
import { SettingsTab } from "./TabSettings";
import { MainTab } from "./TabMain";
import { DefaultSettings, Settings } from "../types";

const App = () => {
  const globalContext: GlobalContextType | null = useContext(GlobalContext);
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

    if (globalContext?.initApp) return <Text>Initializing app...</Text>;
    else if (globalContext?.apiData && !globalContext?.apiData.hasChargebackRole)
      return <EmptyState header="You don't have access to this app." />;

    const onChangeSettings = (newSettings: Settings) => {
      setSettings(newSettings);
    };

    return (
      <>
        <Tabs id="default" defaultSelected={0}>
          <TabList>
            <Tab>Chargeback process</Tab>
            <Tab>Settings</Tab>
          </TabList>
          <TabPanel>
            <Box padding="space.100">
              <MainTab settings={settings} baseUrl={globalContext?.apiData.baseUrl ?? ""} />
            </Box>
          </TabPanel>
          <TabPanel>
            <Box padding="space.100">
              <SettingsTab settings={settings} loading={loading} onChange={onChangeSettings} />
            </Box>
          </TabPanel>
        </Tabs>
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
