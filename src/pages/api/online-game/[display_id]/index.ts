import { type APIRoute } from "astro";
import addNewMove from "../../../../db/game-halfmove/addNewMove";
import updateGameResult from "../../../../db/game/updateGameResult";
import type { APIGetPostHalfmove } from "../../../../db/types";
import isUserAllowedToMove from "../../../../db/game/isUserAllowedToMove";
import isMoveValid from "../../../../db/game/isMoveValid";
import { getGameId } from "../../../../db/game/convertGameIds";
import OnlineGameController from "../../../../scripts-server/onlineGameController";

export const POST: APIRoute = async ({ request, locals, url, params }) => {
  try {
    const data: APIGetPostHalfmove = await request.json();
    const displayId = params.display_id as string;
    const id = await getGameId(displayId);
    const { user } = locals;
    if (user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    if (id === null) {
      return new Response(null, {
        status: 404,
        statusText: "Game not found",
      });
    }
    const isAllowedOrStatusCode = await isUserAllowedToMove(user, displayId);
    if (isAllowedOrStatusCode !== true) {
      return new Response(null, {
        status: isAllowedOrStatusCode.code,
        statusText: isAllowedOrStatusCode.message,
      });
    }
    const isMoveValidData = await isMoveValid(data, displayId);

    if (isMoveValidData.errData !== undefined) {
      return new Response(null, {
        status: isMoveValidData.errData.code,
        statusText: isMoveValidData.errData.message,
      });
    }
    await addNewMove(data, id);
    if (isMoveValidData.endInfo !== undefined) {
      updateGameResult(isMoveValidData.endInfo, displayId);
    }

    OnlineGameController.getInstance(displayId).addMove({
      from: { y: data.pos_start_y, x: data.pos_start_x },
      to: { y: data.pos_end_y, x: data.pos_end_x },
      promotedTo: data.promoted_to_piece_symbol_fen,
    });

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
