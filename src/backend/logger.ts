import { SETTINGS } from "./consts";

const log = (message: string, ...optionnalParams: any[]) => {
  if (SETTINGS.LOG_LEVEL === "debug") console.log(message, ...optionnalParams);
};
export { log };
