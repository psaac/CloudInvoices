import React, { createContext, useEffect, useState } from "react";
import { invoke } from "@forge/bridge";

// Define the context type
export interface GlobalContextType {
  apiData: any;
  initApp: boolean;
}

// Global Context creation
export const GlobalContext = createContext<GlobalContextType | null>(null);

// Global provider
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [apiData, setApiData] = useState<{
    serverInfos: any;
    hasChargebackRole?: boolean;
  } | null>(null);
  const [initApp, setIsInitApp] = useState(true);

  //
  useEffect(() => {
    const fetchData = async () => {
      try {
        const serverInfos: any = (await invoke("getServerInfos")) || {};
        // Check if current user has chargeback role
        const hasChargebackRole: boolean =
          (await invoke("getCurrentUserHasChargebackRole")) || false;

        setApiData({
          ...(typeof serverInfos === "object" ? serverInfos : {}),
          hasChargebackRole: hasChargebackRole,
        });
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
