import type { GetDBAppUser } from "../../../db/types";
import type { SearchGetResult } from "../../../pages/api/search-name-display-email/[alias].json";

export async function fetchUsers(
  userAlias: string
): Promise<SearchGetResult | GetDBAppUser[]> {
  if (userAlias.length === 0) {
    const res = await fetch(`${import.meta.env.PUBLIC_URL}/api/friends`);
    return (await res.json()) as GetDBAppUser[];
  }
  const res = await fetch(
    `${import.meta.env.PUBLIC_URL}/api/search-name-display-email/${userAlias}.json`
  );
  return (await res.json()) as SearchGetResult;
}

export async function postFriendInvite(userToId: string) {
  await fetch(`${import.meta.env.PUBLIC_URL}/api/friend-invite/${userToId}`, {
    method: "POST",
  });
}

export async function acceptFriendInvite(userToId: string) {
  await deleteFriendInvite(userToId);
  await postFriendConnection(userToId);
}

export async function deleteFriendInvite(userToId: string) {
  await fetch(`${import.meta.env.PUBLIC_URL}/api/friend-invite/${userToId}`, {
    method: "DELETE",
  });
}

async function postFriendConnection(userToId: string) {
  await fetch(
    `${import.meta.env.PUBLIC_URL}/api/friend-connection/${userToId}`,
    { method: "POST" }
  );
}

export async function deleteFriendConnection(userToId: string) {
  await fetch(
    `${import.meta.env.PUBLIC_URL}/api/friend-connection/${userToId}`,
    { method: "DELETE" }
  );
}
