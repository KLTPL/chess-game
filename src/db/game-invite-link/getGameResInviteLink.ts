import type { QueryResult } from "pg";
import { queryDB } from "../connect";
import type { GetResponseGameInviteLink } from "../types";
import { getUserById } from "../app-user/getUser";
import removeGameInviteLink from "./removeGameInviteLink";

type InviteLinkData = {
  id: string;
  user_from_id: string;
  is_user_from_white: boolean | null;
  create_timestamp: string;
};

export default async function getGameResInviteLinkData(
  displayId: string
): Promise<GetResponseGameInviteLink | null> {
  const resInviteLinkData: QueryResult<InviteLinkData> = await queryDB(
    `SELECT id, is_user_from_white, user_from_id, create_timestamp
    FROM game_invite_link 
    WHERE display_id = $1`,
    [displayId]
  );
  if (resInviteLinkData.rowCount === 0) {
    return null;
  }
  const inviteData = resInviteLinkData.rows[0];
  const timestamp = new Date(inviteData.create_timestamp);

  if (new Date().getTime() - timestamp.getTime() > 15 * 60 * 1000) {
    // if more than 15 minutes
    removeGameInviteLink(inviteData.id);
    return null;
  }
  const user = await getUserById(inviteData.user_from_id);
  if (user === null) {
    return null;
  }
  return {
    id: inviteData.id,
    is_user_from_white: inviteData.is_user_from_white,
    user_from: user,
  };
}
