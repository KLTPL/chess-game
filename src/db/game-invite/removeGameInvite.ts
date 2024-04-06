import { queryDB } from "../connect";

export default async function removeGameInvite(
  gameInviteId: string,
  users?: { userFromId: string; userToId: string }
) {
  const res =
    users === undefined
      ? await queryDB(
          `
          DELETE FROM game_invite 
          WHERE id = $1;
        `,
          [gameInviteId]
        )
      : await queryDB(
          `
          DELETE FROM game_invite 
          WHERE id = $1 AND user_from_id = $2 AND user_to_id = $3;
        `,
          [gameInviteId, users.userFromId, users.userToId]
        );
  return res.rowCount !== null && res.rowCount > 0;
}
