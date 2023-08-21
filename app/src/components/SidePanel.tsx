import { OPERATOR_KEYS, OperatorKey, getOperator } from "@/types/operator";
import { CheckedState } from "@radix-ui/react-checkbox";
import Link from "next/link";
import { useContext } from "react";
import { MapContext } from "./MapProvider";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

const SidePanel = () => {
  const mapContext = useContext(MapContext);

  return (
    <div className="flex flex-col">
      <Label>Operator</Label>
      <div className="pt-2">
        {(OPERATOR_KEYS as (keyof Record<OperatorKey, boolean>)[]).map(
          (operator) => (
            <div key={operator} className="flex items-center py-1">
              <Checkbox
                id={`operator-${operator}`}
                checked={mapContext?.operators[operator] || false}
                onCheckedChange={(checked: CheckedState) => {
                  if (checked !== "indeterminate") {
                    mapContext?.onOperatorCheck(operator, checked);
                  }
                }}
              />
              <Label htmlFor={`operator-${operator}`} className="pl-2">
                {getOperator(operator)}
              </Label>
            </div>
          ),
        )}
      </div>
      <Link
        className="mt-4 text-center text-sm hover:text-slate-600"
        href="https://belnetmon.bn.by/"
        rel="noopener noreferrer"
        target="_blank"
      >
        BELNETMON
      </Link>
    </div>
  );
};

export default SidePanel;
