import { type APIRoute } from "astro";
import getPlayerGames from "../../../db/getPlayerGames";

export const GET: APIRoute = async ({ params }) => {
  const name = params.name as string;
  const data = await getPlayerGames(name);

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
};
