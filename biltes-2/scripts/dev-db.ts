// Yerel geliştirme için gömülü PostgreSQL (Docker gerektirmez). Üretimde KULLANILMAZ.
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), ".devdb");
const port = Number(process.env.DEV_DB_PORT ?? 54329);

async function main() {
  const fresh = !fs.existsSync(path.join(dir, "PG_VERSION"));
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
    user: "biltes",
    password: "biltes_dev_only",
    port,
    persistent: true,
  });
  if (fresh) await pg.initialise();
  await pg.start();
  if (fresh) await pg.createDatabase("biltes");
  console.log(`Yerel PostgreSQL hazır: postgresql://biltes:biltes_dev_only@localhost:${port}/biltes`);
  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30);
}
main();
