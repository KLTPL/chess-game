import { queryDB } from "./connect";

export default async function removeFriendInvite(
  userFromId: string,
  userToId: string,
) {
  await queryDB(`
    DELETE FROM friend_invite 
    WHERE 
      (user_from_id = $1 AND user_to_id = $2) OR
      (user_from_id = $2 AND user_to_id = $1);
  `, [userFromId, userToId]);
}