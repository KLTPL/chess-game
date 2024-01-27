import { queryDB } from "../../db/connect";
import { type APIRoute } from "astro";

export const GET: APIRoute = async () => {
  try {
    const res = await queryDB("SELECT * FROM game;");
    return new Response(JSON.stringify(res.rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    return new Response(`Error: ${err}`, {
      status: 500,
    });
  }
};
