export type OperatorKey = "M" | "V" | "B" | "4";

export const OPERATOR_KEYS: OperatorKey[] = ["M", "V", "B", "4"];

export const getOperatorText = (operator: string): string | undefined => {
  switch (operator) {
    case "V":
      return "A1";
    case "M":
      return "MTS";
    case "B":
      return "life:)";
    case "4":
      return "beCloud";
  }
};
