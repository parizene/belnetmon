import { getOperatorText, OPERATOR_KEYS, OperatorKey } from "@/types/operator";
import { useContext } from "react";
import CheckboxSelector from "./CheckboxSelector";
import { MapContext } from "./MapProvider";

const MapOperatorSelector = ({ className = "" }: { className?: string }) => {
  const mapContext = useContext(MapContext);

  return (
    <CheckboxSelector<OperatorKey>
      className={className}
      title="Operator"
      keys={OPERATOR_KEYS}
      getItemText={(key: OperatorKey) => getOperatorText(key) || key}
      checkedMap={mapContext?.operatorMap ?? {}}
      onItemCheck={(key, checked) => mapContext?.onOperatorCheck(key, checked)}
      idPrefix="operator"
    />
  );
};

export default MapOperatorSelector;
