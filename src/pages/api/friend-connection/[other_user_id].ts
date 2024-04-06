import type { APIRoute } from "astro";
import addFriendConnection from "../../../db/friend-connection/addFriendConnection";
import removeFriendConnection from "../../../db/friend-connection/removeFriendConnection";

export const POST: APIRoute = async ({ params, locals, url }) => {
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
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
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params, locals, url }) => {
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
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
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
