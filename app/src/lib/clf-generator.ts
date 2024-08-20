import { cell as Cell } from "@prisma/client";

export type ClfRow = {
  mnc: string;
  lac: number;
  cid: number;
  lat: number | null;
  lon: number | null;
  info: string;
};

export type Clf30HexRow = {
  mccMnc: string;
  cid: string;
  lac: string;
  rnc: string;
  lat: string;
  lon: string;
  rat: number;
  info: string;
  rfu: number;
};

const MCC = "257";
const DEFAULT_RNC = "0x0000";
const DEFAULT_RAT = -1;
const DEFAULT_RFU = 0;

export function generateClfRows(cell: Cell): ClfRow[] {
  const mnc = getMnc(cell.operator);
  if (!mnc) return [];

  const items: { lac: number; cid: number; info: string }[] = [];

  const addItemIfValid = (
    lac: number | null,
    cid: number | null,
    sectors: number[],
    prefix: string,
    calculateCid: (cid: number, sector: number) => number,
  ) => {
    if (lac !== null && cid !== null && sectors.length) {
      sectors.forEach((sector) => {
        const newCid = calculateCid(cid, sector);
        const prefixedInfo = [prefix, cell.city, cell.address, cell.remark]
          .filter(Boolean)
          .join(", ");
        items.push({ lac, cid: newCid, info: prefixedInfo });
      });
    }
  };

  if (cell.operator === "4") {
    const postfix = cell.is_lte_a1 ? " (v)" : "";
    addItemIfValid(
      cell.lac,
      cell.cid,
      cell.sectors_gsm_b20,
      `LTE B20${postfix}`,
      calculateCidForLte,
    );
    addItemIfValid(
      cell.lac_u900_b7,
      cell.cid_u900_b7,
      cell.sectors_u900_b7,
      `LTE B7${postfix}`,
      calculateCidForLte,
    );
    addItemIfValid(
      cell.lac_3g_b3,
      cell.cid_3g_b3,
      cell.sectors_3g_b3,
      `LTE B3${postfix}`,
      calculateCidForLte,
    );
  } else {
    addItemIfValid(
      cell.lac,
      cell.cid,
      cell.sectors_gsm_b20,
      "",
      calculateCidForOther,
    );
    addItemIfValid(
      cell.lac,
      cell.cid,
      cell.sectors_dcs,
      "",
      calculateCidForOther,
    );
    addItemIfValid(
      cell.lac_u900_b7,
      cell.cid_u900_b7,
      cell.sectors_u900_b7,
      "U900",
      calculateCidForOther,
    );
    addItemIfValid(
      cell.lac_3g_b3,
      cell.cid_3g_b3,
      cell.sectors_3g_b3,
      "3G",
      calculateCidForOther,
    );
  }

  return items.map((item) => ({
    mnc,
    lac: item.lac,
    cid: item.cid,
    lat: cell.latitude,
    lon: cell.longitude,
    info: item.info,
  }));
}

const calculateCidForLte = (cid: number, sector: number): number => {
  return cid * 256 + sector;
};

const calculateCidForOther = (cid: number, sector: number): number => {
  return cid * 10 + sector;
};

export function mapClfRow(
  clfRow: ClfRow,
  overrideOperator?: string,
): Clf30HexRow {
  const mnc = getMnc(overrideOperator) || clfRow.mnc;

  return {
    mccMnc: `${MCC}${mnc}`,
    cid: `0x${decToHex(clfRow.cid)}`,
    lac: `0x${decToHex(clfRow.lac)}`,
    rnc: DEFAULT_RNC,
    lat: clfRow.lat?.toString() || "",
    lon: clfRow.lon?.toString() || "",
    rat: DEFAULT_RAT,
    info: clfRow.info,
    rfu: DEFAULT_RFU,
  };
}

function getMnc(operator: string | undefined): string | undefined {
  switch (operator) {
    case "V":
      return "01";
    case "M":
      return "02";
    case "B":
      return "04";
    case "4":
      return "06";
  }
}

function decToHex(decimal: number, padding: number = 4): string {
  return decimal.toString(16).toUpperCase().padStart(padding, "0");
}
