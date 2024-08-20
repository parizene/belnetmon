import { generateClfRows, mapClfRow } from "@/lib/clf-generator";
import { AREA_KEYS, AreaKey } from "@/types/area";
import {
  FILTERABLE_OPERATOR_KEYS,
  FilterableOperatorKey,
  OPERATOR_KEYS,
  OperatorKey,
} from "@/types/operator";
import { format } from "@fast-csv/format";
import { PrismaClient } from "@prisma/client";
import archiver from "archiver";
import { NextRequest, NextResponse } from "next/server";
import { PassThrough } from "stream";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { operator, area }: { operator?: string[]; area?: string[] } = json;

    const operatorFilter: OperatorKey[] | undefined = operator?.filter(
      (op): op is FilterableOperatorKey => {
        return OPERATOR_KEYS.includes(op as OperatorKey) && op !== "4";
      },
    );

    const areaFilter: AreaKey[] | undefined = area?.filter(
      (ar): ar is AreaKey => {
        return AREA_KEYS.includes(ar as AreaKey);
      },
    );

    const whereCondition: any = {};

    if (operatorFilter && operatorFilter.length) {
      whereCondition.operator = {
        in: [...operatorFilter, "4"],
      };
    }

    if (areaFilter && areaFilter.length) {
      whereCondition.area = {
        in: areaFilter,
      };
    }

    const passThroughStream = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 9 } });

    const csvStream = format({ headers: false, delimiter: ";" });
    const csvFileName = "unite_v30.clf";
    archive.append(csvStream, { name: csvFileName });

    const cells = await prisma.cell.findMany({ where: whereCondition });

    const customOrder = ["M", "V", "B", "4"];
    cells.sort(
      (a, b) =>
        customOrder.indexOf(a.operator) - customOrder.indexOf(b.operator),
    );

    cells.forEach((cell) => {
      const clfRows = generateClfRows(cell);

      if (cell.operator !== "4") {
        clfRows.forEach((clfRow) => {
          csvStream.write(mapClfRow(clfRow));
        });
      } else {
        const operatorsToProcess =
          operatorFilter && operatorFilter.length
            ? operatorFilter
            : FILTERABLE_OPERATOR_KEYS;
        operatorsToProcess.forEach((op) => {
          clfRows.forEach((clfRow) => {
            csvStream.write(mapClfRow(clfRow, op));
          });
        });
      }
    });

    csvStream.end();
    await archive.finalize();

    const readableStream = new ReadableStream({
      start(controller) {
        passThroughStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        passThroughStream.on("end", () => {
          controller.close();
        });
        passThroughStream.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    archive.pipe(passThroughStream);

    const headers = new Headers();
    headers.append("Content-Type", "application/zip");
    headers.append("Content-Disposition", "attachment; filename=database.zip");

    return new NextResponse(readableStream, { headers });
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("JSON parsing error:", error);
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 },
      );
    } else {
      console.error("Failed to process request:", error);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 },
      );
    }
  }
}