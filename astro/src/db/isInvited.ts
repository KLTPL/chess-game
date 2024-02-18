import { queryDB } from "./connect";

export default async function isInvited(
  idSelf: string,
  idOther: string
): Promise<boolean> {
  const resResultInvite = await queryDB(
    `
      SELECT * FROM friend_invite
      WHERE user_from_id = $1 AND user_to_id = $2;
    `,
    [idSelf, idOther]
  );
  return resResultInvite.rowCount !== 0;
}
