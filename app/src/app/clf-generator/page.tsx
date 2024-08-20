"use client";

import CheckboxSelector from "@/components/CheckboxSelector";
import LoadingProgress from "@/components/LoadingProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { AREA_KEYS, AreaKey, getAreaText } from "@/types/area";
import {
  FILTERABLE_OPERATOR_KEYS,
  FilterableOperatorKey,
  getOperatorText,
} from "@/types/operator";
import { useCallback, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [operatorMap, setOperatorMap] = useState<
    Record<FilterableOperatorKey, boolean>
  >({
    M: false,
    V: false,
    B: false,
  });
  const [areaMap, setAreaMap] = useState<Record<AreaKey, boolean>>({
    BRO: false,
    "BR.": false,
    GOO: false,
    "GO.": false,
    GRO: false,
    "GR.": false,
    MIO: false,
    "MI.": false,
    MOO: false,
    "MO.": false,
    VIO: false,
    "VI.": false,
  });

  const { toast } = useToast();

  const onOperatorCheck = useCallback(
    async (operator: FilterableOperatorKey, checked: boolean) => {
      setOperatorMap((prevOperatorMap) => ({
        ...prevOperatorMap,
        [operator]: checked,
      }));
    },
    [],
  );

  const onAreaCheck = useCallback(async (area: AreaKey, checked: boolean) => {
    setAreaMap((prevAreaMap) => ({
      ...prevAreaMap,
      [area]: checked,
    }));
  }, []);

  const handleGenerateButtonClick = async () => {
    setLoading(true);

    const selectedOperators = Object.keys(operatorMap).filter(
      (key) => operatorMap[key as FilterableOperatorKey],
    ) as FilterableOperatorKey[];

    const selectedAreas = Object.keys(areaMap).filter(
      (key) => areaMap[key as AreaKey],
    ) as AreaKey[];

    try {
      const payload = {
        ...(selectedOperators.length > 0 && { operator: selectedOperators }),
        ...(selectedAreas.length > 0 && { area: selectedAreas }),
      };

      const res = await fetch("/api/generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        toast({
          title: "Error",
          description: `Generate failed: ${
            errorResponse.error || "An error occurred"
          }`,
        });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database.zip";
      document.body.appendChild(a); // Required for this to work in FireFox
      a.click();
      a.remove(); // Clean up the DOM
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto md:w-[768px]">
      <Card className="mx-4 my-4">
        <CardContent>
          <div className="grid grid-cols-1 gap-4 p-4 md:w-full md:grid-cols-2">
            <CheckboxSelector<FilterableOperatorKey>
              className=""
              defaultOpen={true}
              title="Operator"
              keys={FILTERABLE_OPERATOR_KEYS}
              getItemText={(key: FilterableOperatorKey) =>
                getOperatorText(key) || key
              }
              checkedMap={operatorMap}
              onItemCheck={onOperatorCheck}
              idPrefix="operator"
            />
            <CheckboxSelector<AreaKey>
              className=""
              defaultOpen={true}
              title="Area"
              keys={AREA_KEYS}
              getItemText={(key: AreaKey) => getAreaText(key) || key}
              checkedMap={areaMap}
              onItemCheck={onAreaCheck}
              idPrefix="area"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="flex flex-row items-center justify-center">
          <Button
            type="button"
            onClick={handleGenerateButtonClick}
            disabled={loading}
          >
            Generate
          </Button>
        </div>
        {loading && <LoadingProgress className="mt-4" />}
      </div>
    </div>
  );
}
