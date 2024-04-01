import type { APIRoute } from "astro";
import getFriends from "../../../db/friend-connection/getFriends";
import type { GetResultRelatedUsers } from "../../../db/types";
import getAllInvitedUsers from "../../../db/app-user/getAllInvitedUsers";
import getAllUsersWhoInvited from "../../../db/app-user/getAllUsersWhoInvited";

export const GET: APIRoute = async ({ locals, url }) => {
  try {
    if (locals.user === undefined) {
      throw new Error(
        `User (locals.user) is not defined in a protected route ${url.pathname}`
      );
    }
    const selfId = locals.user.id;

    const result: GetResultRelatedUsers = {
      friends: [],
      invited: [],
      whoInvited: [],
      blocked: [],
    };

    result.friends = await getFriends(selfId);
    result.invited = await getAllInvitedUsers(selfId);
    result.whoInvited = await getAllUsersWhoInvited(selfId);

    return new Response(JSON.stringify(result), {
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
