import { AREA_KEYS, AreaKey, getAreaText } from "@/types/area";
import { useContext } from "react";
import CheckboxSelector from "./CheckboxSelector";
import { MapContext } from "./MapProvider";

const MapAreaSelector = ({ className = "" }: { className?: string }) => {
  const mapContext = useContext(MapContext);

  return (
    <CheckboxSelector<AreaKey>
      className={className}
      title="Area"
      keys={AREA_KEYS}
      getItemText={(key: AreaKey) => getAreaText(key) || key}
      checkedMap={mapContext?.areaMap ?? {}}
      onItemCheck={(key, checked) => mapContext?.onAreaCheck(key, checked)}
      idPrefix="area"
    />
  );
};

export default MapAreaSelector;
