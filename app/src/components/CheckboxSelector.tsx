import { cn } from "@/lib/utils";
import { CheckedState } from "@radix-ui/react-checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Label } from "./ui/label";

interface CheckboxSelectorProps<T extends string> {
  className?: string;
  defaultOpen?: boolean;
  title: string;
  keys: readonly T[];
  getItemText: (key: T) => string;
  checkedMap: Partial<Record<T, boolean>>;
  onItemCheck: (key: T, checked: boolean) => void;
  idPrefix: string;
}

function CheckboxSelector<T extends string>({
  className = "",
  defaultOpen = undefined,
  title,
  keys,
  getItemText,
  checkedMap,
  onItemCheck,
  idPrefix,
}: CheckboxSelectorProps<T>) {
  const trueValueCount = useMemo(() => {
    return Object.values(checkedMap).filter(Boolean).length;
  }, [checkedMap]);

  const handleCheckboxChange = (key: T, checked: CheckedState) => {
    if (checked !== "indeterminate") {
      onItemCheck(key, checked);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <Collapsible defaultOpen={defaultOpen}>
        <div className="mb-2 flex w-44 items-center justify-between space-x-4">
          <Label>
            {title} {trueValueCount > 0 && `(${trueValueCount})`}
          </Label>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Toggle">
              <CaretSortIcon className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          {keys.map((key) => (
            <div key={key} className="flex items-center py-1">
              <Checkbox
                id={`${idPrefix}-${key}`}
                checked={checkedMap[key] ?? false}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(key, checked)
                }
              />
              <Label htmlFor={`${idPrefix}-${key}`} className="pl-2">
                {getItemText(key)}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default CheckboxSelector;
