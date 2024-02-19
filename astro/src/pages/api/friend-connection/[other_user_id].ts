import type { APIRoute } from "astro";
import addFriendConnection from "../../../db/friend-connection/addFriendConnection";
import removeFriendConnection from "../../../db/friend-connection/removeFriendConnection";

export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const userFromId = locals.user.id;
    const userToId = params.other_user_id as string;

    await addFriendConnection(userFromId, userToId);

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
    const userToId = params.other_user_id as string;

    await removeFriendConnection(userFromId, userToId);

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
