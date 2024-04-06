import type { APIRoute } from "astro";
import getResultName from "../../../db/dict-game-result/getResultName";

export const GET: APIRoute = async ({ params }) => {
  try {
    const data = await getResultName(params.id as string);

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
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
