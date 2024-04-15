import type { APIRoute } from "astro";
import type { APIGetUserGames } from "../../../../db/types";
import getUserGames from "../../../../db/game/getUserGames";

export const GET: APIRoute = async ({ params }) => {
  try {
    const data: APIGetUserGames = {
      id: params.userId as string,
      startIdx: parseInt(params.startIdx as string),
      endIdx: parseInt(params.endIdx as string),
    };
    const games = await getUserGames(data);
    if (games === null) {
      return new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }
    return new Response(JSON.stringify(games), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
