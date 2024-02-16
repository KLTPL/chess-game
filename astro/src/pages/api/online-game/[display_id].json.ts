import { type APIRoute } from "astro";
import getGameData from "../../../db/getGameData";
import addNewMove from "../../../db/addNewMove";
import updateGameResult from "../../../db/updateGameResult";
import type { GetPostDBHalfmove, PutDBGame } from "../../../db/types";

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: GetPostDBHalfmove = await request.json();
    addNewMove(data);

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

export const PUT: APIRoute = async ({ request }) => {
  try {
    const data: PutDBGame = await request.json();

    updateGameResult(data);

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
