import { cn } from "@/lib/utils";
import { getOperatorText, OPERATOR_KEYS, OperatorKey } from "@/types/operator";
import { CheckedState } from "@radix-ui/react-checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useContext, useMemo } from "react";
import { MapContext } from "./MapProvider";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Label } from "./ui/label";

interface OperatorSelectorProps {
  className?: string;
}

const OperatorSelector = ({ className = "" }: OperatorSelectorProps) => {
  const mapContext = useContext(MapContext);

  const trueValueCount = useMemo(() => {
    if (!mapContext?.operatorMap) return 0;
    return Object.values(mapContext.operatorMap).filter(
      (value) => value === true,
    ).length;
  }, [mapContext?.operatorMap]);

  return (
    <div className={cn(className, "flex flex-col")}>
      <Collapsible>
        <div className="mb-2 flex items-center justify-between space-x-4">
          <Label>
            Operator {trueValueCount > 0 ? `(${trueValueCount})` : ""}
          </Label>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <CaretSortIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {(OPERATOR_KEYS as (keyof Record<OperatorKey, boolean>)[]).map(
            (operator) => (
              <div key={operator} className="flex items-center py-1">
                <Checkbox
                  id={`operator-${operator}`}
                  checked={mapContext?.operatorMap[operator] || false}
                  onCheckedChange={(checked: CheckedState) => {
                    if (checked !== "indeterminate") {
                      mapContext?.onOperatorCheck(operator, checked);
                    }
                  }}
                />
                <Label htmlFor={`operator-${operator}`} className="pl-2">
                  {getOperatorText(operator)}
                </Label>
              </div>
            ),
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default OperatorSelector;
