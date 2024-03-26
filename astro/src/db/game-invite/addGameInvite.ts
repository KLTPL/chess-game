import { queryDB } from "../connect";

export default async function addGameInvite(
  userFromId: string,
  userToId: string,
  isUserFromWhite: boolean | null
) {
  if (isUserFromWhite === null) {
    await queryDB(
      `
      INSERT INTO game_invite
      (user_from_id, user_to_id)
      VALUES ($1, $2);
    `,
      [userFromId, userToId]
    );
  } else {
    await queryDB(
      `
      INSERT INTO game_invite
      (user_from_id, user_to_id, is_user_from_white)
      VALUES ($1, $2, $3);
    `,
      [userFromId, userToId, String(isUserFromWhite)]
    );
  }
}
