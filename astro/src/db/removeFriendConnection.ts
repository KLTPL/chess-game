import { queryDB } from "./connect";

export default async function removeFriendConnection(
  userFromId: string,
  userToId: string,
) {
  console.log("delete friend connection", userFromId, userToId);
  await queryDB(`
    DELETE FROM friend_connection 
    WHERE 
      (user_1_id = $1 AND user_2_id = $2) OR 
      (user_1_id = $2 AND user_2_id = $1);
  `, [userFromId, userToId]);
}