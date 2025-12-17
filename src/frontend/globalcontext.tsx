import React, { FC, ReactNode, createContext, useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { DefaultSettings, ServerInfo, emptyServerInfo, Settings } from "../types";

interface GlobalProps {
  serverInfos: ServerInfo;
  settings: Settings;
  hasChargebackRole: boolean;
}
const emptyGlobalProps: GlobalProps = {
  serverInfos: emptyServerInfo,
  settings: DefaultSettings,
  hasChargebackRole: false,
};
// Define the context type
export interface GlobalContextType {
  apiData: GlobalProps;
  initApp: boolean;
}

// Global Context creation
export const GlobalContext = createContext<GlobalContextType | null>(null);

// Global provider
export const GlobalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [apiData, setApiData] = useState<GlobalProps>(emptyGlobalProps);
  const [initApp, setIsInitApp] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newApiData = apiData;
        const serverInfos: any = (await invoke("getServerInfos")) || {};
        newApiData.serverInfos = typeof serverInfos === "object" ? serverInfos : {};

        // Load settings to check user role
        newApiData.settings = await invoke<Settings>("getSettings", {});

        // Check if current user has chargeback role
        newApiData.hasChargebackRole =
          (await invoke("getCurrentUserHasChargebackRole", { settings: newApiData.settings })) || false;

        setApiData(newApiData);
      } catch (error) {
        console.error("API Error :", error);
      } finally {
        setIsInitApp(false);
      }
    };

    fetchData();
  }, []);
  return (
    <GlobalContext.Provider
      value={{
        apiData,
        initApp,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
