import { type APIRoute } from "astro";
import getGameData from "../../../db/game/getGameData";
import addNewMove from "../../../db/game-halfmove/addNewMove";
import updateGameResult from "../../../db/game/updateGameResult";
import type { APIGetOnlineGame, APIGetPostHalfmove } from "../../../db/types";
import isUserAllowedToMove from "../../../db/game/isUserAllowedToMove";
import isMoveValid from "../../../db/game/isMoveValid";
import { getGameId } from "../../../db/game/convertGameIds";

export const GET: APIRoute<APIGetOnlineGame> = async ({ params, locals }) => {
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
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};

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

// export const PUT: APIRoute = async ({ request, locals, url }) => {
//   try {
//     const data: PutDBGame = await request.json();
//     const { user } = locals;
//     if (user === undefined) {
//       throw new Error(
//         `User (locals.user) is not defined in a protected route ${url.pathname}`
//       );
//     }
//     const isAllowedOrStatusCode = await isUserAllowedToMove(user, data.id);
//     if (isAllowedOrStatusCode === true) {
//       updateGameResult(data);
//       return new Response(null, {
//         status: 200,
//       });
//     }

//     return new Response(null, {
//       status: isAllowedOrStatusCode.code,
//       statusText: isAllowedOrStatusCode.message,
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error(error.message);
//       return new Response(null, { status: 500, statusText: error.message });
//     }
//     return new Response(null, { status: 500 });
//   }
// };
