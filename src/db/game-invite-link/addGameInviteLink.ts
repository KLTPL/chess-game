import { queryDB } from "../connect";
import generateUniqueDisplayId from "../generateDisplayId";

export default async function addGameInviteLink(
  userFromId: string,
  isUserFromWhite: boolean | null
) {
  const displayId = await generateUniqueDisplayId(isDisplayIdUnique);
  if (isUserFromWhite === null) {
    await queryDB(
      `
      INSERT INTO game_invite_link 
         (display_id, user_from_id)
      VALUES ($1, $2);`,
      [displayId, userFromId]
    );
  } else {
    await queryDB(
      `
      INSERT INTO game_invite_link 
         (display_id, user_from_id, is_user_from_white)
      VALUES ($1, $2, $3);`,
      [displayId, userFromId, String(isUserFromWhite)]
    );
  }
  return displayId;
}

async function isDisplayIdUnique(displayId: string): Promise<boolean> {
  const queryRes = await queryDB(
    `SELECT * FROM game_invite_link WHERE display_id = $1`,
    [displayId]
  );
  return queryRes.rows.length === 0;
}
