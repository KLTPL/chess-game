import type { APIRoute } from "astro";
import addNewGame from "../../../db/game/addNewGame";
import addGameInviteLink from "../../../db/game-invite-link/addGameInviteLink";
import type {
  DeleteGameInviteLink,
  PostGameInviteLink,
  PostResultGameInviteLink,
  PutGameInviteLink,
  PutResponseGameInvite,
} from "../../../db/types";
import removeGameInviteLink from "../../../db/game-invite-link/removeGameInviteLink";
import getGameInviteLinkData, {
  type GameInviteLinkData,
} from "../../../db/game-invite-link/getGameInviteLink";
import isGameInviteLinkValid from "../../../db/game-invite-link/isGameInviteLinkValid";

export const POST: APIRoute = async ({ locals, request, url }) => {
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    const userFromId = locals.user.id;
    const body: PostGameInviteLink = await request.json();
    const isUserFromWhite = body.isUserFromWhite;

    const displayId = await addGameInviteLink(userFromId, isUserFromWhite);
    const result: PostResultGameInviteLink = {
      inviteLink: `${import.meta.env.PUBLIC_URL}/game-invite/${displayId}`,
    };
    return new Response(JSON.stringify(result), {
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

export const PUT: APIRoute = async ({ request, locals, url }) => {
  // accept endpoint (delete this and createa new game)
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    const userToId = locals.user.id;
    const body: PutGameInviteLink = await request.json();
    const id = body.id;
    const gameInviteLinkData = await getGameInviteLinkData(id);
    const responseOrIsValid = await isGameInviteLinkValid(
      gameInviteLinkData,
      userToId
    );

    if (responseOrIsValid !== true) {
      return responseOrIsValid;
    }
    const validData = gameInviteLinkData as GameInviteLinkData;
    await removeGameInviteLink(id);

    const gameDisplayId = await addNewGame(
      validData.user_from_id,
      userToId,
      validData.is_user_from_white
    );

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
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body: DeleteGameInviteLink = await request.json();
    const id = body.id;

    await removeGameInviteLink(id);

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
