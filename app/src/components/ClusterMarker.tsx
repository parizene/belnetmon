import { LatLngExpression, divIcon, point } from "leaflet";
import { Marker } from "react-leaflet";

const ClusterMarker = ({
  count,
  position,
}: {
  count: number;
  position: LatLngExpression;
}) => {
  const createClusterIcon = (count: number) => {
    return divIcon({
      html: `<span>${count}</span>`,
      className:
        "bg-slate-500 text-white font-bold !flex items-center justify-center rounded-full border-white border-4 border-opacity-50",
      iconSize: point(40, 40, true),
    });
  };

  const icon = createClusterIcon(count);

  return <Marker position={position} icon={icon} />;
};

export default ClusterMarker;
