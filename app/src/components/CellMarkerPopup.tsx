import { getOperator } from "@/types/operator";
import { cell as Cell } from "@prisma/client";
import { format } from "date-fns";
import { Popup } from "react-leaflet";

const CellMarkerPopup = ({ cell }: { cell: Cell }) => {
  return (
    <Popup>
      <div>
        <p>{getOperator(cell.operator)}</p>
        <p>{cell.area}</p>
        <p>{cell.city}</p>
        <p>{cell.cb}</p>
        {cell.lac && cell.cid && (
          <p className="font-semibold">{`${cell.lac} ${cell.cid} ${cell.sectors_gsm} ${cell.sectors_dcs}`}</p>
        )}
        {cell.lac_3g && cell.cid_3g && (
          <p className="font-semibold">{`${cell.lac_3g} ${cell.cid_3g} ${cell.sectors_3g}`}</p>
        )}
        {cell.lac_u900 && cell.cid_u900 && (
          <p className="font-semibold">{`${cell.lac_u900} ${cell.cid_u900} ${cell.sectors_u900}`}</p>
        )}
        <p>
          {cell.date ? format(new Date(cell.date), "dd.MM.yyyy") : undefined}
        </p>
        <p>{cell.address}</p>
        <p>{cell.remark}</p>
      </div>
    </Popup>
  );
};

export default CellMarkerPopup;
