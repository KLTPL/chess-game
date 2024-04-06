import type { GetDBGameData } from "../types";
import getGameData from "./getGameData";
import { getGameDisplayId } from "./getGameDisplayId";

export default async function isUserAllowedToMove(
  user: { id: string },
  gameId: string
): Promise<true | { code: number; message: string }> {
  // returns true of the http status code
  try {
    const gameDisplayId = await getGameDisplayId(gameId);
    if (gameDisplayId === null) {
      return { code: 404, message: `Game not found` };
    }

    const gameData = await getGameData(gameDisplayId);

    if (gameData === null) {
      throw new Error(
        `Found game display_id by game id, but did not managed, to get game data by game display_id. Something weird just happend`
      );
    }

    const moveUserId = getUserIdWhomMoveItIs(gameData);

    if (user.id !== moveUserId) {
      return { code: 403, message: "It is another user whos move it is" };
    }

    return true;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return { code: 500, message: err.message };
    }
    return { code: 500, message: "Server error" };
  }
}

function getUserIdWhomMoveItIs(gameData: GetDBGameData) {
  return gameData.halfmoves.length % 2 === 0
    ? gameData.game.user_w_id
    : gameData.game.user_b_id;
}
