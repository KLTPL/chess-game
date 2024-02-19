import { queryDB } from "../connect";

export default async function addFriendInvite(
  userFromId: string,
  userToId: string
) {
  await queryDB(
    `
    INSERT INTO friend_invite
    (user_from_id, user_to_id)
    VALUES ($1, $2);
  `,
    [userFromId, userToId]
  );
}
