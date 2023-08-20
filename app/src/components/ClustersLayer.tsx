import { OperatorKey } from "@/types/operator";
import { Icon } from "leaflet";
import { useContext, useEffect } from "react";
import { Marker, useMap } from "react-leaflet";
import CellMarkerPopup from "./CellMarkerPopup";
import ClusterMarker from "./ClusterMarker";
import { MapContext } from "./MapProvider";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const LeafIcon: any = Icon.extend({
  options: {
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    // tooltipAnchor: [16, -28],
  },
});

const blueIcon = new LeafIcon({
  iconUrl: "marker-icon-blue.png",
  iconRetinaUrl: "marker-icon-2x-blue.png",
});

const redIcon = new LeafIcon({
  iconUrl: "marker-icon-red.png",
  iconRetinaUrl: "marker-icon-2x-red.png",
});

const violetIcon = new LeafIcon({
  iconUrl: "marker-icon-violet.png",
  iconRetinaUrl: "marker-icon-2x-violet.png",
});

const yellowIcon = new LeafIcon({
  iconUrl: "marker-icon-yellow.png",
  iconRetinaUrl: "marker-icon-2x-yellow.png",
});

const getIcon = (operator: OperatorKey): Icon | undefined => {
  switch (operator) {
    case "V":
      return yellowIcon;
    case "M":
      return redIcon;
    case "B":
      return violetIcon;
    case "4":
      return blueIcon;
  }
};

export const ClustersLayer = () => {
  const map = useMap();
  const mapContext = useContext(MapContext);

  const fetchClusters = async () => {
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    mapContext?.onMapZoomBoundsChange({ zoom, bbox });
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  useEffect(() => {
    const updateClusters = () => {
      fetchClusters();
    };

    map.on("moveend", updateClusters);

    return () => {
      map.off("moveend", updateClusters);
    };
  }, [map, fetchClusters]);

  return (
    <>
      {mapContext?.clusters &&
        mapContext?.clusters.map((cluster: any, index: number) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { point_count: pointCount } = cluster.properties;

          if (pointCount > 1) {
            return (
              <ClusterMarker
                key={index}
                count={pointCount}
                position={[latitude, longitude]}
              />
            );
          } else {
            const cell = cluster.properties;
            return (
              <Marker
                key={cell.id}
                position={[latitude, longitude]}
                icon={cell.operator ? getIcon(cell.operator) : undefined}
              >
                <CellMarkerPopup cell={cell} />
              </Marker>
            );
          }
        })}
    </>
  );
};
