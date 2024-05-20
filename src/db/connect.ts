import pg from "pg";

const Pool = pg.Pool;

const pool = new Pool({
  user: import.meta.env.POSTGRES_USER,
  password: import.meta.env.POSTGRES_PASSWORD,
  host: import.meta.env.POSTGRES_HOST,
  port: parseInt(import.meta.env.POSTGRES_PORT),
  database: import.meta.env.POSTGRES_DATABASE,
  ssl: true,
});

pool.connect();

export async function queryDB(query: string, values?: (number | string)[]) {
  return await pool.query(query, values);
}
