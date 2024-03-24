import { type APIRoute } from "astro";
import getGameData from "../../../db/game/getGameData";
import addNewMove from "../../../db/game-halfmove/addNewMove";
import updateGameResult from "../../../db/game/updateGameResult";
import type {
  GetDBGameData,
  GetPostDBHalfmove,
  PutDBGame,
} from "../../../db/types";
import isUserAllowedToMove from "../../../db/game/isUserAllowedToMove";
import isMoveValid from "../../../db/game/isMoveValid";

export type GetOnlineGame = {
  getDBGameData: GetDBGameData;
  userId: string | undefined;
};

export const GET: APIRoute<GetOnlineGame> = async ({ params, locals }) => {
  try {
    const data = await getGameData(params.display_id as string);

    if (data === null) {
      return new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }

    return new Response(
      JSON.stringify({ getDBGameData: data, userId: locals.user?.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return new Response(null, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data: GetPostDBHalfmove = await request.json();
    const { user } = locals;
    const isAllowedOrStatusCode = await isUserAllowedToMove(user, data.game_id);
    if (isAllowedOrStatusCode !== true) {
      return new Response(null, {
        status: isAllowedOrStatusCode,
      });
    }
    const isMoveValidOrStatusCode = await isMoveValid(data);
    if (isMoveValidOrStatusCode !== true) {
      return new Response(null, {
        status: isMoveValidOrStatusCode,
      });
    }
    await addNewMove(data);
    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return new Response(null, { status: 500 });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  try {
    const data: PutDBGame = await request.json();
    const { user } = locals;
    const isAllowedOrStatusCode = await isUserAllowedToMove(user, data.id);
    if (isAllowedOrStatusCode === true) {
      updateGameResult(data);
      return new Response(null, {
        status: 200,
      });
    }

    return new Response(null, {
      status: isAllowedOrStatusCode,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return new Response(null, { status: 500 });
  }
};
