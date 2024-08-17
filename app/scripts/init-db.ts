require("dotenv").config();

import { Client } from "pg";

if (!process.env.SCRIPTS_DATABASE_URL) {
  throw new Error(
    "SCRIPTS_DATABASE_URL is not defined in the environment variables.",
  );
}

const db = new Client({
  connectionString: process.env.SCRIPTS_DATABASE_URL,
});

db.connect()
  .then(async () => {
    await initDb();
    shutdown();
  })
  .catch((err) => {
    console.warn(err);
    shutdown(1);
  });

const shutdown = (exitCode = 0) => {
  db.end()
    .then(() => {
      process.exit(exitCode);
    })
    .catch((err) => {
      console.warn(err);
      process.exit(1);
    });
};

async function initDb() {
  try {
    await db.query("BEGIN");

    try {
      await db.query(`
        CREATE OR REPLACE FUNCTION cell_location_fn() RETURNS TRIGGER AS
        $$
        BEGIN
          IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
            NEW.location := geography(ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326));
          ELSE
            NEW.location := NULL;
          END IF;
          RETURN NEW;
        END;
        $$
        LANGUAGE plpgsql;
      `);

      await db.query(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cell_location_tr') THEN
                CREATE TRIGGER cell_location_tr
                BEFORE INSERT OR UPDATE OF latitude, longitude ON cell
                FOR EACH ROW EXECUTE FUNCTION cell_location_fn();
            END IF;
        END
        $$;
      `);

      await db.query("COMMIT");
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error(error);
  }
}
