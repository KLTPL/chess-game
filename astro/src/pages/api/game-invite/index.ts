import type { APIRoute } from "astro";
import addGameInvite from "../../../db/game-invite/addGameInvite";
import removeGameInvite from "../../../db/game-invite/removeGameInvite";
import addNewGame from "../../../db/game/addNewGame";
import type {
  DeleteGameInvite,
  PostGameInvite,
  PutGameInvite,
  PutResponseGameInvite,
} from "../../../db/types";
import isFriend from "../../../db/friend-connection/isFriend";

export const POST: APIRoute = async ({ locals, request, url }) => {
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    const userFromId = locals.user.id;
    const body: PostGameInvite = await request.json();
    const userToId = body.userToId;
    const isUserFromWhite = body.isUserFromWhite;
    if (!(await isFriend(userFromId, userToId))) {
      return new Response(null, { status: 409 });
    }

    await addGameInvite(userFromId, userToId, isUserFromWhite);

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

export const PUT: APIRoute = async ({ request, locals, url }) => {
  // accept endpoint (delete this and createa new game)
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    const userToId = locals.user.id;
    const body: PutGameInvite = await request.json();
    const inviteId = body.inviteId;
    const userFromId = body.userFromId;

    if (!(await isFriend(userFromId, userToId))) {
      return new Response(null, { status: 409 });
    }

    const isRemoved = await removeGameInvite(inviteId, {
      userFromId,
      userToId,
    });

    if (!isRemoved) {
      return new Response(null, { status: 409 });
    }

    const gameDisplayId = await addNewGame(userToId, userFromId, null);
    const response: PutResponseGameInvite = {
      newGamePath: `/online-game/${gameDisplayId}`,
    };
    return new Response(JSON.stringify(response), {
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

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body: DeleteGameInvite = await request.json();
    const inviteId = body.inviteId;

    await removeGameInvite(inviteId);

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
