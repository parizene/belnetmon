"use client";

import { Cluster } from "@/types/cluster";
import { OperatorKey } from "@/types/operator";
import React, { createContext, useCallback, useEffect, useState } from "react";

type MapContextType = {
  clusters: Cluster[];
  operators: Record<OperatorKey, boolean>;
  onMapZoomBoundsChange: (zoomBounds: ZoomBounds) => void;
  onOperatorCheck: (operator: OperatorKey, checked: boolean) => void;
};

export const MapContext = createContext<MapContextType | null>(null);

type ZoomBounds = {
  zoom: number;
  bbox: number[];
};

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [zoomBounds, setZoomBounds] = useState<ZoomBounds | null>(null);
  const [operators, setOperators] = useState<Record<OperatorKey, boolean>>({
    M: false,
    V: false,
    B: false,
    "4": false,
  });

  const onMapZoomBoundsChange = useCallback(async (zoomBounds: ZoomBounds) => {
    setZoomBounds(zoomBounds);
  }, []);

  const onOperatorCheck = useCallback(
    async (operator: OperatorKey, checked: boolean) => {
      setOperators((prevOperators) => ({
        ...prevOperators,
        [operator]: checked,
      }));
    },
    [],
  );

  const fetchClusters = async (
    zoom: number,
    bbox: number[],
    operators: string[],
  ) => {
    let url = `/api/clusters?bbox=${bbox.join(",")}&zoom=${zoom}`;
    if (operators.length) {
      url += `&operators=${operators.join(",")}`;
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

    const selectedOperators = Object.keys(operators)
      .filter((key) => operators[key as OperatorKey])
      .map((key) => key as OperatorKey);

    debouncedFetch(zoomBounds.zoom, zoomBounds.bbox, selectedOperators);
  }, [zoomBounds, operators]);

  return (
    <MapContext.Provider
      value={{ clusters, operators, onMapZoomBoundsChange, onOperatorCheck }}
    >
      {children}
    </MapContext.Provider>
  );
};
