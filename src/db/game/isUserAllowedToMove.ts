import type { APIGetGameData } from "../types";
import getGameData from "./getGameData";

export default async function isUserAllowedToMove(
  user: { id: string },
  displayId: string
): Promise<true | { code: number; message: string }> {
  // returns true of the http status code
  try {
    const gameData = await getGameData(displayId);

    if (gameData === null) {
      return { code: 404, message: `Game not found` };
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

function getUserIdWhomMoveItIs(gameData: APIGetGameData) {
  return gameData.halfmoves.length % 2 === 0
    ? gameData.game.user_w_id
    : gameData.game.user_b_id;
}
