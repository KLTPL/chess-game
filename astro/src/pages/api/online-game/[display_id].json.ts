import { type APIRoute } from "astro";
import getGameData from "../../../db/getGameData";
import addNewMove, { type addNewMoveProps } from "../../../db/addNewMove";

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

export const POST: APIRoute = async ({ request }) => {
  try {
    const data: addNewMoveProps = await request.json();

    addNewMove(data);

    return new Response(null, {
      status: 200,
    });
  } catch (err) {
    return new Response(null, {
      status: 500,
    });
  }
};
