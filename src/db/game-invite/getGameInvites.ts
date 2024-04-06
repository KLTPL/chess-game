import { queryDB } from "../connect";
import type { GetDBGameInvite } from "../types";

export default async function getGameInvites(
  userToId: string
): Promise<GetDBGameInvite[]> {
  const queryRes = await queryDB(
    `
    SELECT gi.id as game_invite_id, gi.is_user_from_white, u.* FROM 
    (SELECT * FROM game_invite WHERE user_to_id = $1) gi
    INNER JOIN app_user u
    ON gi.user_from_id = u.id;
  `,
    [userToId]
  );
  const result: GetDBGameInvite[] = queryRes.rows.map((res) => {
    const gameInvite: GetDBGameInvite = {
      id: res.game_invite_id,
      user_from: {
        id: res.id,
        email: res.email,
        name: res.name,
        display_name: res.display_name,
        is_active: res.is_active,
        date_create: res.date_create,
        date_last_login: res.date_last_login,
      },
      is_user_from_white: res.is_user_from_white,
    };
    return gameInvite;
  });
  return result;
}
