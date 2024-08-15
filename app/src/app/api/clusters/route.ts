import { OPERATOR_KEYS, OperatorKey } from "@/types/operator";
import { cell as Cell, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import Supercluster from "supercluster";

const prisma = new PrismaClient();

const supercluster = new Supercluster({
  radius: 80,
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

  let cells: Cell[] = [];
  try {
    const t1 = performance.now();
    cells = await prisma.cell.findMany({
      where: whereCondition,
    });
    console.debug(`SQL query executed in ${performance.now() - t1}ms`);
  } catch (e) {
    console.error("Failed to fetch cells:", e);
  }

  const points: Supercluster.PointFeature<Cell>[] = cells.map((cell) => ({
    type: "Feature",
    properties: {
      ...cell,
    },
    geometry: {
      type: "Point",
      coordinates: [cell.longitude!, cell.latitude!],
    },
  }));

  supercluster.load(points);

  const clusters = supercluster.getClusters(bbox, zoom);

  return NextResponse.json(clusters);
}
