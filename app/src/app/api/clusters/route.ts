import { AREA_KEYS, AreaKey } from "@/types/area";
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
  const _operator = req.nextUrl.searchParams.get("operator");
  const _area = req.nextUrl.searchParams.get("area");

  const bbox = (_bbox ? _bbox.split(",").map(Number) : undefined) as
    | [number, number, number, number]
    | undefined;
  const zoom = _zoom ? parseInt(_zoom) : undefined;

  if (!bbox || !zoom) {
    return NextResponse.json([]);
  }

  const operator =
    _operator
      ?.split(",")
      .filter((key) => OPERATOR_KEYS.includes(key as OperatorKey)) || [];

  const area =
    _area?.split(",").filter((key) => AREA_KEYS.includes(key as AreaKey)) || [];

  let whereCondition: any = {
    latitude: {
      not: null,
    },
    longitude: {
      not: null,
    },
  };

  if (operator.length) {
    whereCondition["operator"] = {
      in: operator,
    };
  }

  if (area.length) {
    whereCondition["area"] = {
      in: area,
    };
  }

  let cells: Cell[];
  try {
    const t1 = performance.now();
    cells = await prisma.cell.findMany({
      where: whereCondition,
    });
    console.debug(`SQL query executed in ${performance.now() - t1}ms`);
  } catch (e) {
    console.error("Failed to fetch cells:", e);
    return NextResponse.json([]);
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
