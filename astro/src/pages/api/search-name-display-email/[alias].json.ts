import type { APIRoute } from "astro";
import { getUsersByNameOrDisplayNameOrEmail } from "../../../db/app-user/getUser";
import type {
  GetDBAppUser,
  GetResultSearchNameDisplayEmail,
} from "../../../db/types";
import isFriend from "../../../db/friend-connection/isFriend";
import isInvited from "../../../db/friend-invite/isInvited";
import isWhoInvited from "../../../db/friend-invite/isWhoInvited";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const selfId = locals.user?.id;
    if (selfId === undefined) {
      throw new Error("User id is undefined in a protected route");
    }
    const alias = params.alias as string;
    const result: GetResultSearchNameDisplayEmail = {
      friends: [],
      invited: [],
      whoInvited: [],
      suggestions: [],
      blocked: [],
    };
    const allUsers = await getUsersByNameOrDisplayNameOrEmail(alias as string);
    for (let i = 0; i < allUsers.length; i++) {
      const currUser = allUsers[i];

      if (selfId === currUser.id) {
        allUsers.splice(i, 1);
        i--;
      }
      if (await isFriend(selfId, currUser.id)) {
        result.friends.push(currUser);
        allUsers.splice(i, 1);
        i--;
      }
      if (await isInvited(selfId, currUser.id)) {
        result.invited.push(currUser);
        allUsers.splice(i, 1);
        i--;
      }
      if (await isWhoInvited(selfId, currUser.id)) {
        result.whoInvited.push(currUser);
        allUsers.splice(i, 1);
        i--;
      }
    }
    result.suggestions = allUsers;
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
