import { queryDB } from "../connect";

export default async function addGameInvite(
  userFromId: string,
  userToId: string
) {
  await queryDB(
    `
    INSERT INTO game_invite
    (user_from_id, user_to_id)
    VALUES ($1, $2);
  `,
    [userFromId, userToId]
  );
}
