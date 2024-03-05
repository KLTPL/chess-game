import { type APIRoute } from "astro";
import getGameData from "../../../db/game/getGameData";
import addNewMove from "../../../db/game-halfmove/addNewMove";
import updateGameResult from "../../../db/game/updateGameResult";
import type { GetPostDBHalfmove, PutDBGame } from "../../../db/types";
import isUserAllowedToMove from "../../../db/game/isUserAllowedToMove";

export const GET: APIRoute = async ({ params }) => {
  try {
    const data = await getGameData(params.display_id as string);

    if (data === null) {
      return new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
    if (isAllowedOrStatusCode === true) {
      await addNewMove(data);
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
