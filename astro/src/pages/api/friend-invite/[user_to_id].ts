import type { APIRoute } from "astro";
import addFriendInvite from "../../../db/friend-invite/addFriendInvite";
import removeFriendInvite from "../../../db/friend-invite/removeFriendInvite";
import isFriend from "../../../db/friend-connection/isFriend";

export const POST: APIRoute = async ({ params, locals, url }) => {
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    const userFromId = locals.user.id;
    const userToId = params.user_to_id as string;

    if (await isFriend(userFromId, userToId)) {
      return new Response(null, {
        status: 409,
      });
    }

    await addFriendInvite(userFromId, userToId);

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
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
    const userToId = params.user_to_id as string;

    await removeFriendInvite(userFromId, userToId);

    return new Response(null, {
      status: 200,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return new Response(null, { status: 500 });
  }
};
