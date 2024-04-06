import pg from "pg";

const Pool = pg.Pool;

const pool = new Pool({
  user: import.meta.env.PSQL_USER,
  password: import.meta.env.PSQL_PASSWORD,
  host: import.meta.env.PSQL_HOST,
  port: parseInt(import.meta.env.PSQL_PORT),
  database: import.meta.env.PSQL_DATABASE,
});

pool.connect();

export async function queryDB(query: string, values?: (number | string)[]) {
  return await pool.query(query, values);
}
