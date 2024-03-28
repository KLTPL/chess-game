import type { QueryResult } from "pg";
import { queryDB } from "../connect";

export type GameInviteLinkData = {
  user_from_id: string;
  is_user_from_white: boolean | null;
};

export default async function getGameInviteLinkData(
  id: string
): Promise<GameInviteLinkData | null> {
  const res: QueryResult<GameInviteLinkData> = await queryDB(
    `
    SELECT user_from_id, is_user_from_white FROM game_invite_link
    WHERE id = $1;
  `,
    [id]
  );
  return res.rows.length === 0 ? null : res.rows[0];
}
