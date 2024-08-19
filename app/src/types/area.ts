export type AreaKey =
  | "BRO"
  | "BR."
  | "GOO"
  | "GO."
  | "GRO"
  | "GR."
  | "MIO"
  | "MI."
  | "MOO"
  | "MO."
  | "VIO"
  | "VI.";

export const AREA_KEYS: AreaKey[] = [
  "BR.",
  "BRO",
  "GO.",
  "GOO",
  "GR.",
  "GRO",
  "MI.",
  "MIO",
  "MO.",
  "MOO",
  "VI.",
  "VIO",
];

export const getAreaText = (area: string): string | undefined => {
  switch (area) {
    case "BRO":
      return "Brest Region";
    case "BR.":
      return "Brest";
    case "GOO":
      return "Gomel Region";
    case "GO.":
      return "Gomel";
    case "GRO":
      return "Grodno Region";
    case "GR.":
      return "Grodno";
    case "MIO":
      return "Minsk Region";
    case "MI.":
      return "Minsk";
    case "MOO":
      return "Mogilev Region";
    case "MO.":
      return "Mogilev";
    case "VIO":
      return "Vitebsk Region";
    case "VI.":
      return "Vitebsk";
  }
};
