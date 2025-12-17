export const round2 = (num: number): number => {
  return Math.round(num * 100) / 100;
};

export interface WithMaps {
  [key: string]: any;
}

function mapReplacer(_: string, value: any): any {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()),
    };
  }
  return value;
}

// Reviver pour la désérialisation
function mapReviver(_: string, value: any): any {
  if (typeof value === "object" && value !== null && value.dataType === "Map") {
    return new Map(value.value);
  }
  return value;
}

export function loadWithMapsFromRaw<T extends WithMaps>(raw: string): T {
  return JSON.parse(raw, mapReviver) as T;
}

export const saveWithMapsFromRaw = <T extends WithMaps>(data: T): string => {
  return JSON.stringify(data, mapReplacer, 2);
};
