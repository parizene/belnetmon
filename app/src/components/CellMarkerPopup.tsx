import { getAreaText } from "@/types/area";
import { getOperatorText } from "@/types/operator";
import { Cell } from "@prisma/client";
import { format } from "date-fns";
import { Popup } from "react-leaflet";

const CellMarkerPopup = ({ cell }: { cell: Cell }) => {
  return (
    <Popup>
      <div>
        <p>{getOperatorText(cell.operator)}</p>
        <p>{getAreaText(cell.area)}</p>
        <p>{cell.city}</p>
        <p>{cell.cb}</p>
        {cell.lac && cell.cid && (
          <p className="font-semibold">{`${cell.lac} ${cell.cid} ${cell.sectors_gsm_b20} ${cell.sectors_dcs}`}</p>
        )}
        {cell.lac_3g_b3 && cell.cid_3g_b3 && (
          <p className="font-semibold">{`${cell.lac_3g_b3} ${cell.cid_3g_b3} ${cell.sectors_3g_b3}`}</p>
        )}
        {cell.lac_u900_b7 && cell.cid_u900_b7 && (
          <p className="font-semibold">{`${cell.lac_u900_b7} ${cell.cid_u900_b7} ${cell.sectors_u900_b7}`}</p>
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
