import React, { useState, useEffect } from "react";
import { Box, Button, Inline, Label, Textfield, Text } from "@forge/react";
import Cookies from "js-cookie";
import { invoke } from "@forge/bridge";
import { Settings } from "../types";
import { TaskTable } from "./taskTable";
import { Task } from "../types";
import Loading from "./components/loading";

export const MainTab = ({ settings, baseUrl }: { settings: Settings; baseUrl: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [batchId, setBatchId] = useState<string>("");
  const [tasks, setTasks] = useState<Array<Task>>([]);
  const [chargebackAssets, setChargebackAssets] = useState<string>("");

  useEffect(() => {
    let cookie = "";
    try {
      cookie = Cookies.get("batchId") || "";
    } catch (e) {
      cookie = "";
    }
    if (cookie) {
      setBatchId(cookie);
    }
  }, []);

  const batchIdChanged = (newBatchId: string) => {
    setBatchId(newBatchId);
    try {
      Cookies.set("batchId", newBatchId, { expires: 365 });
    } catch (e) {
      console.error("Error setting cookie :", e);
    }
  };

  const getTasksByBatchId = async () => {
    setLoading(true);
    try {
      const fetchedChagrebackAssets = await invoke<{
        attrs: Array<{ id: string; name: string }>;
        assets: Array<any>;
      }>("loadChargebackAssets", {
        settings,
      });
      setChargebackAssets(`Chargeback Assets Loaded: ${JSON.stringify(fetchedChagrebackAssets.assets)}`);

      // const fetchedTasks = await invoke<Array<Task>>("getTasksByBatchId", {
      //   batchId: batchId,
      //   settings,
      //   baseUrl,
      // });
      // setTasks(fetchedTasks);
      setTasks([]);
      console.log("Tasks fetched successfully", baseUrl);
    } catch (error) {
      console.error("JIRA API Error :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Inline space="space.200" alignBlock="end">
        <Box padding="space.200">
          <Label labelFor="batchId">Batch ID</Label>
          <Textfield
            id="batchId"
            value={batchId}
            onChange={(e) => batchIdChanged(e.target.value)}
            isDisabled={loading}
          />
        </Box>
        <Text>{chargebackAssets}</Text>
        {loading && <Loading />}
        <Box padding="space.200">
          <Button
            appearance="primary"
            onClick={() => getTasksByBatchId()}
            isDisabled={loading || !batchId || batchId.trim() === ""}
          >
            Step 1 : Fill application accounts
          </Button>
        </Box>
      </Inline>

      <TaskTable taskList={tasks} />
    </>
  );
};
