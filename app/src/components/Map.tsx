import { LatLngExpression, Marker, icon } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { ClustersLayer } from "./ClustersLayer";

Marker.prototype.options.icon = icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  // tooltipAnchor: [16, -28],
});

const Map = () => {
  const MINSK: LatLngExpression = [53.9023, 27.5615];

  return (
    <MapContainer
      center={MINSK}
      zoom={13}
      zoomControl={true}
      className="h-screen"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClustersLayer />
    </MapContainer>
  );
};

export default Map;
