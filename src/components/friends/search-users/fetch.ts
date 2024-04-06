import type {
  GetResultRelatedUsers,
  GetResultSearchNameDisplayEmail,
} from "../../../db/types";

export async function fetchUsers(
  userAlias: string
): Promise<GetResultSearchNameDisplayEmail | GetResultRelatedUsers> {
  if (userAlias.length <= 1) {
    const res = await fetch(
      `${import.meta.env.PUBLIC_URL}/api/related-users.json`
    );
    return (await res.json()) as GetResultRelatedUsers;
  }
  const res = await fetch(
    `${import.meta.env.PUBLIC_URL}/api/search-alias/${userAlias}.json`
  );
  return (await res.json()) as GetResultSearchNameDisplayEmail;
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