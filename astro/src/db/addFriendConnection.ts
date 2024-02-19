import { queryDB } from "./connect";

export default async function addFriendConnection(
  userFromId: string,
  userToId: string
) {
  await queryDB(
    `
    INSERT INTO friend_connection
    (user_1_id, user_2_id)
    VALUES ($1, $2);
  `,
    [userFromId, userToId]
  );
}
