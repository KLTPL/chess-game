import type { QueryResult } from "pg";
import { queryDB } from "../connect";
import getGameData from "./getGameData";
import type { APIGetGameData, APIGetUserGames } from "../types";
import isUserInDB from "../app-user/isUserInDB";

export default async function getUserGames({
  id,
  startIdx,
  endIdx,
}: APIGetUserGames): Promise<APIGetGameData[] | null> {
  if (!(await isUserInDB(id))) {
    return null;
  }
  const resDisplayIds = await getResDisplayIds(id);
  const games: APIGetGameData[] = [];
  for (
    let i = startIdx;
    resDisplayIds.rowCount !== null &&
    i < resDisplayIds.rowCount &&
    i <= endIdx;
    i++
  ) {
    const gameData = await getGameData(resDisplayIds.rows[i].display_id);
    if (gameData === null) {
      return null;
    }
    games.push(gameData);
  }

  return games;
}

async function getResDisplayIds(
  id: string
): Promise<QueryResult<{ display_id: string }>> {
  return await queryDB(
    `
    SELECT DISTINCT g.display_id, MIN(g.start_date) AS start_date
    FROM (SELECT * FROM app_user WHERE id = $1) a
    JOIN game g
    ON (a.id = g.user_w_id or a.id = g.user_b_id)
    GROUP BY g.display_id
    ORDER BY start_date DESC;
    `,
    [id]
  );
}
