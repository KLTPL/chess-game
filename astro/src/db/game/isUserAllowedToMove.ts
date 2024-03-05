import { queryDB } from "../connect";
import type { GetDBGameData } from "../types";
import getGameData from "./getGameData";

export default async function isUserAllowedToMove(
  user: { id: string } | undefined,
  gameId: string
): Promise<true | number> {
  // returns true of the http status code
  try {
    if (user === undefined) {
      return 401;
    }

    const gameDisplayId = await getGameDisplayId(gameId);
    if (gameDisplayId === null) {
      throw `Game id not corresponding to any game in the database`;
    }

    const gameData = await getGameData(gameDisplayId);

    if (gameData === null) {
      throw `Found game display_id by game id, but did not managed, to get game data by game display_id. Something weird just happend`;
    }

    const moveUserId = getUserIdWhomMoveItIs(gameData);

    if (user.id !== moveUserId) {
      return 403;
    }

    return true;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return 400;
  }
}

async function getGameDisplayId(gameId: string): Promise<string | null> {
  const res = await queryDB(
    `
    SELECT display_id FROM game
    WHERE id = $1`,
    [gameId]
  );
  if (res.rows.length === 0) {
    return null;
  }
  return res.rows[0].display_id as string;
}

function getUserIdWhomMoveItIs(gameData: GetDBGameData) {
  return gameData.halfmoves.length % 2 === 0
    ? gameData.game.user_w_id
    : gameData.game.user_b_id;
}
