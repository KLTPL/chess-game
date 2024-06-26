import type { APIRoute } from "astro";
import getFriends from "../../../db/friend-connection/getFriends";
import type { APIRespGetRelatedUsers } from "../../../db/types";
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

    const result: APIRespGetRelatedUsers = {
      friends: [],
      invited: [],
      whoInvited: [],
      blocked: [],
      type: "APIRespGetRelatedUsers",
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
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
