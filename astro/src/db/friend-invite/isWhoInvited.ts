import { queryDB } from "../connect";

export default async function isWhoInvited(
  idSelf: string,
  idOther: string
): Promise<boolean> {
  const resResultWhoInvited = await queryDB(
    `
      SELECT * FROM friend_invite
      WHERE user_from_id = $1 AND user_to_id = $2;
    `,
    [idOther, idSelf]
  );
  return resResultWhoInvited.rowCount !== 0;
}
