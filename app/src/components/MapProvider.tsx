"use client";

import { AreaKey } from "@/types/area";
import { Cluster } from "@/types/cluster";
import { OperatorKey } from "@/types/operator";
import React, { createContext, useCallback, useEffect, useState } from "react";

type MapContextType = {
  clusters: Cluster[];
  operatorMap: Record<OperatorKey, boolean>;
  areaMap: Record<AreaKey, boolean>;
  onMapZoomBoundsChange: (zoomBounds: ZoomBounds) => void;
  onOperatorCheck: (operator: OperatorKey, checked: boolean) => void;
  onAreaCheck: (operator: AreaKey, checked: boolean) => void;
};

export const MapContext = createContext<MapContextType | null>(null);

type ZoomBounds = {
  zoom: number;
  bbox: number[];
};

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [zoomBounds, setZoomBounds] = useState<ZoomBounds | null>(null);
  const [operatorMap, setOperatorMap] = useState<Record<OperatorKey, boolean>>({
    M: false,
    V: false,
    B: false,
    "4": false,
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

  const onMapZoomBoundsChange = useCallback(async (zoomBounds: ZoomBounds) => {
    setZoomBounds(zoomBounds);
  }, []);

  const onOperatorCheck = useCallback(
    async (operator: OperatorKey, checked: boolean) => {
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

  const fetchClusters = async (
    zoom: number,
    bbox: number[],
    operatorKeys: string[],
    areaKeys: string[],
  ) => {
    let url = `/api/clusters?bbox=${bbox.join(",")}&zoom=${zoom}`;
    if (operatorKeys.length) {
      url += `&operator=${operatorKeys.join(",")}`;
    }
    if (areaKeys.length) {
      url += `&area=${areaKeys.join(",")}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      setClusters(await res.json());
    }
  };

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: any[]) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const debouncedFetch = useCallback(debounce(fetchClusters, 500), []);

  useEffect(() => {
    if (!zoomBounds) {
      return;
    }

    const selectedOperatorKeys = Object.keys(operatorMap)
      .filter((key) => operatorMap[key as OperatorKey])
      .map((key) => key as OperatorKey);

    const selectedAreaKeys = Object.keys(areaMap)
      .filter((key) => areaMap[key as AreaKey])
      .map((key) => key as AreaKey);

    debouncedFetch(
      zoomBounds.zoom,
      zoomBounds.bbox,
      selectedOperatorKeys,
      selectedAreaKeys,
    );
  }, [zoomBounds, operatorMap, areaMap]);

  return (
    <MapContext.Provider
      value={{
        clusters,
        operatorMap,
        areaMap,
        onMapZoomBoundsChange,
        onOperatorCheck,
        onAreaCheck,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
