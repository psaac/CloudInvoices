export interface InvoiceLine {
  ChargebackIdStr: string;
  Summary: string;
  Key: string;
  Link: string;
}

export const getChargebackIdStr = (prefix: string, chargebackId: number): string => {
  return `${prefix}${chargebackId.toString().padStart(5, "0")}`;
};
