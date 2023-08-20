import { OPERATOR_KEYS, OperatorKey } from "@/types/operator";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import Supercluster from "supercluster";

const prisma = new PrismaClient();

const supercluster = new Supercluster({
  radius: 40,
  maxZoom: 15,
});

export async function GET(req: NextRequest) {
  const _bbox = req.nextUrl.searchParams.get("bbox");
  const _zoom = req.nextUrl.searchParams.get("zoom");
  const _operators = req.nextUrl.searchParams.get("operators");

  const bbox = (_bbox ? _bbox.split(",").map(Number) : undefined) as
    | [number, number, number, number]
    | undefined;
  const zoom = _zoom ? parseInt(_zoom) : undefined;

  if (!bbox || !zoom) {
    return NextResponse.json([]);
  }

  const operators =
    _operators
      ?.split(",")
      .filter((op) => OPERATOR_KEYS.includes(op as OperatorKey)) || [];

  let whereCondition: any = {
    latitude: {
      not: null,
    },
    longitude: {
      not: null,
    },
  };

  if (operators.length) {
    whereCondition["operator"] = {
      in: operators,
    };
  }

  const cells = await prisma.cell.findMany({
    where: whereCondition,
  });

  supercluster.load(
    cells.map((cell) => ({
      type: "Feature",
      properties: {
        ...cell,
      },
      geometry: {
        type: "Point",
        coordinates: [cell.longitude!, cell.latitude!],
      },
    }))
  );

  const clusters = supercluster.getClusters(bbox, zoom);

  return NextResponse.json(clusters);
}
