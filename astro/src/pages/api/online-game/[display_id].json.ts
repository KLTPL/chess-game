import { type APIRoute } from "astro";
import getGameData from "../../../db/getGameData";

export const GET: APIRoute = async ({ params }) => {
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
};
