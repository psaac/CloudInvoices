import { kvs } from "@forge/kvs";
import { Settings, DefaultSettings } from "../types";
import { getAppContext } from "@forge/api";

export default class SettingsCore {
  public static getSettings = async (): Promise<Settings> => {
    try {
      const settings = (await kvs.get(`settings`)) as Settings;
      const defaultSettings = DefaultSettings;
      const appContext = getAppContext();
      defaultSettings.appVersion = appContext.appVersion;
      return { ...defaultSettings, ...settings };
    } catch (error) {
      console.error("Error fetching settings:", error);
      return DefaultSettings;
    }
  };

  public static setSettings = async (settings: Settings): Promise<void> => {
    try {
      await kvs.set(`settings`, settings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };
}
