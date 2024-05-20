import type {
  APIRespGetRelatedUsers,
  APIRespGetSearchAlias,
} from "../../../db/types";

export async function fetchUsers(
  userAlias: string
): Promise<APIRespGetSearchAlias | APIRespGetRelatedUsers> {
  if (userAlias.length <= 1) {
    const res = await fetch(`/api/related-users`);
    return (await res.json()) as APIRespGetRelatedUsers;
  }
  const res = await fetch(`/api/search-alias/${userAlias}`);
  return (await res.json()) as APIRespGetSearchAlias;
}

export async function postFriendInvite(userToId: string) {
  await fetch(`/api/friend-invite/${userToId}`, {
    method: "POST",
  });
}

export async function acceptFriendInvite(userToId: string) {
  await deleteFriendInvite(userToId);
  await postFriendConnection(userToId);
}

export async function deleteFriendInvite(userToId: string) {
  await fetch(`/api/friend-invite/${userToId}`, {
    method: "DELETE",
  });
}

async function postFriendConnection(userToId: string) {
  await fetch(`/api/friend-connection/${userToId}`, { method: "POST" });
}

export async function deleteFriendConnection(userToId: string) {
  await fetch(`/api/friend-connection/${userToId}`, { method: "DELETE" });
}
