import React, { createContext, useEffect, useState } from "react";
import { invoke } from "@forge/bridge";

// Global Context creation
export const GlobalContext = createContext();

// Global provider
export const GlobalProvider = ({ children }) => {
  const [apiData, setApiData] = useState(null);
  const [initApp, setIsInitApp] = useState(true);

  //
  useEffect(() => {
    const fetchData = async () => {
      try {
        const serverInfos = await invoke("getServerInfos");
        // Check if current user has chargeback role
        const hasChargebackRole = await invoke(
          "getCurrentUserHasChargebackRole"
        );

        setApiData({ ...serverInfos, hasChargebackRole: hasChargebackRole }); // Store infos into context to be used later in the app
      } catch (error) {
        console.error("API Error :", error);
      } finally {
        setIsInitApp(false);
      }
    };

    fetchData();
  }, []);

  return (
    <GlobalContext.Provider value={{ apiData, initApp }}>
      {children}
    </GlobalContext.Provider>
  );
};
