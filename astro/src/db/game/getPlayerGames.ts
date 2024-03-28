import type { QueryResult } from "pg";
import { queryDB } from "../connect";
import getGameData from "./getGameData";
import type { GetDBGameData } from "../types";

export default async function getPlayerGames(
  id: string
): Promise<GetDBGameData[] | null> {
  const resDisplayIds = await getResDisplayIds(id);

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
    ON (a.id = g.user_w_id or a.id = g.user_b_id)
    GROUP BY g.display_id
    `,
    [id]
  );
}
