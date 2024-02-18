import type { APIRoute } from "astro";
import addFriendInvite from "../../../db/addFriendInvite";
import removeFriendInvite from "../../../db/removeFriendInvite";

export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const userFromId = locals.user.id;
    const userToId = params.user_to_id as string;

    await addFriendInvite(userFromId, userToId);

    return new Response(null, {
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

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const userFromId = locals.user.id;
    const userToId = params.user_to_id as string;

    await removeFriendInvite(userFromId, userToId);

    return new Response(null, {
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
