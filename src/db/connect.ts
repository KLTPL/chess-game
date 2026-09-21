import pg from "pg";
import { getSecret } from "astro:env/server";

const Pool = pg.Pool;

const pool = new Pool({
  user: getSecret("POSTGRES_USER"),
  password: getSecret("POSTGRES_PASSWORD"),
  host: getSecret("POSTGRES_HOST"),
  port: parseInt(getSecret("POSTGRES_PORT") as string),
  database: getSecret("POSTGRES_APP_DATABASE"),
  ssl: getSecret("POSTGRES_SSL") !== "false",
});

pool.connect();

export async function queryDB(query: string, values?: (number | string)[]) {
  return await pool.query(query, values);
}
