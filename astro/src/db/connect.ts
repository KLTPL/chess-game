import pg from "pg";

const Pool = pg.Pool;

const pool = new Pool({
  user: import.meta.env.USER,
  password: import.meta.env.PASSWORD,
  host: import.meta.env.HOST,
  port: parseInt(import.meta.env.PORT),
  database: import.meta.env.DATABASE,
});

pool.connect();

export async function queryDB(query: string, values?: number[] | string[]) {
  return await pool.query(query, values);
}
