import { kvs } from "@forge/kvs";
import { Settings, DefaultSettings } from "../types";

export default class SettingsCore {
  public static getSettings = async (): Promise<Settings> => {
    try {
      const settings = (await kvs.get(`settings`)) as Settings;
      return settings || DefaultSettings;
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
