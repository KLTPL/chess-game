import type { QueryResult } from "pg";
import { queryDB } from "../connect";
import getGameData from "./getGameData";
import type { GetDBGameData } from "../types";

export default async function getPlayerGames(
  name: string
): Promise<GetDBGameData[] | null> {
  const resUserId = await getResAppUserId(name);

  if (resUserId.rowCount === 0) {
    return null;
  }
  const resDisplayIds = await getResDisplayIds(resUserId.rows[0].id);

  const games: GetDBGameData[] = [];
  for (const { display_id } of resDisplayIds.rows) {
    games.push((await getGameData(display_id)) as GetDBGameData);
  }

  return games;
}

async function getResAppUserId(name: string) {
  return await queryDB(`SELECT id FROM app_user WHERE name = $1`, [name]);
}

async function getResDisplayIds(id: string): Promise<QueryResult<any>> {
  return await queryDB(
    `
    SELECT DISTINCT g.display_id
    FROM (SELECT * FROM app_user WHERE id = $1) a
    JOIN game g
    ON (a.id = g.user_id_w or a.id = g.user_id_b)
    GROUP BY g.display_id
    `,
    [id]
  );
}
