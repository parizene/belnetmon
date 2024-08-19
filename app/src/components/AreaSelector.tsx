import { cn } from "@/lib/utils";
import { AREA_KEYS, AreaKey, getAreaText } from "@/types/area";
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

interface AreaSelectorProps {
  className?: string;
}

const AreaSelector = ({ className = "" }: AreaSelectorProps) => {
  const mapContext = useContext(MapContext);

  const trueValueCount = useMemo(() => {
    if (!mapContext?.areaMap) return 0;
    return Object.values(mapContext.areaMap).filter((value) => value === true)
      .length;
  }, [mapContext?.areaMap]);

  return (
    <div className={cn(className, "flex flex-col")}>
      <Collapsible>
        <div className="mb-2 flex items-center justify-between space-x-4">
          <Label>Area {trueValueCount > 0 ? `(${trueValueCount})` : ""}</Label>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <CaretSortIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {(AREA_KEYS as (keyof Record<AreaKey, boolean>)[]).map((area) => (
            <div key={area} className="flex items-center py-1">
              <Checkbox
                id={`area-${area}`}
                checked={mapContext?.areaMap[area] || false}
                onCheckedChange={(checked: CheckedState) => {
                  if (checked !== "indeterminate") {
                    mapContext?.onAreaCheck(area, checked);
                  }
                }}
              />
              <Label htmlFor={`area-${area}`} className="pl-2">
                {getAreaText(area)}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default AreaSelector;
