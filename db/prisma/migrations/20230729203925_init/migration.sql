-- CreateTable
CREATE TABLE "Cell" (
    "id" SERIAL NOT NULL,
    "operator" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "cb" TEXT NOT NULL,
    "lac" INTEGER,
    "cid" INTEGER,
    "sectors_gsm" INTEGER[],
    "sectors_dcs" INTEGER[],
    "lac_3g" INTEGER,
    "cid_3g" INTEGER,
    "sectors_3g" INTEGER[],
    "lac_u900" INTEGER,
    "cid_u900" INTEGER,
    "sectors_u900" INTEGER[],
    "date" DATE,
    "address" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);
