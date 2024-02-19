import type { APIRoute } from "astro";
import getFriends from "../../../db/getFriends";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const selfId = locals.user.id;

    const res = await getFriends(selfId);

    return new Response(JSON.stringify(res), {
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
