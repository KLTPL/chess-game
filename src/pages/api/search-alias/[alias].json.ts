import type { APIRoute } from "astro";
import { getUserByName, getUsersByAlias } from "../../../db/app-user/getUser";
import type { GetDBAppUser, GetResultSearchAlias } from "../../../db/types";
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

    let allUsers: GetDBAppUser[];
    if (alias[0] === "@") {
      const user = await getUserByName(alias.slice(1));
      allUsers = user === null ? [] : [user];
    } else {
      allUsers = await getUsersByAlias(alias);
    }

    const result = await createResObj(allUsers, selfId);

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

async function createResObj(
  allUsers: GetDBAppUser[],
  selfId: string
): Promise<GetResultSearchAlias> {
  const result: GetResultSearchAlias = {
    friends: [],
    invited: [],
    whoInvited: [],
    suggestions: [],
    blocked: [],
    type: "GetResultSearchAlias",
  };
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
  return result;
}
