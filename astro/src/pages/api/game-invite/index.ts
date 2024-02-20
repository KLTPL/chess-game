import type { APIRoute } from "astro";
import addGameInvite from "../../../db/game-invite/addGameInvite";
import removeGameInvite from "../../../db/game-invite/removeGameInvite";
import addNewGame from "../../../db/game/addNewGame";

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const userFromId = locals.user.id;
    const body = await request.json();
    const userToId = body.userToId as string;

    await addGameInvite(userFromId, userToId);

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
export type PutGameInviteResponse = {
  newGamePath: string;
};
export const PUT: APIRoute = async ({ request, locals, redirect }) => {
  // accept endpoint (delete this and createa new game)
  try {
    const userToId = locals.user.id;
    const body = await request.json();
    const inviteId = body.inviteId as string;
    const userFromId = body.userFromId as string;

    await removeGameInvite(inviteId);

    const gameDisplayId = await addNewGame(userToId, userFromId, null);
    const response: PutGameInviteResponse = {
      newGamePath: `/online-game/${gameDisplayId}`,
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    return new Response(null, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const inviteId = body.inviteId as string;

    await removeGameInvite(inviteId);

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
