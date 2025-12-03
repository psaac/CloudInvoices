import { Settings } from "../types";

export class BaseProcess {
  billingMonth: string;
  settings: Settings;

  constructor(billingMonth: string, settings: Settings) {
    this.billingMonth = billingMonth;
    this.settings = settings;
  }
}
