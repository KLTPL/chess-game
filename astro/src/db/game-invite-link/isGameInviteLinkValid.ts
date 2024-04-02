import isFriend from "../friend-connection/isFriend";
import { type GameInviteLinkData } from "./getGameInviteLink";

export default async function isGameInviteLinkValid(
  gameInviteLinkData: GameInviteLinkData | null,
  userToId: string
): Promise<Response | true> {
  if (gameInviteLinkData === null) {
    return new Response(null, {
      status: 404,
      statusText: "Game invite link not found",
    });
  }
  if (gameInviteLinkData.user_from_id === userToId) {
    return new Response(null, {
      status: 403,
      statusText:
        "Cannot accept game invite becouse the receiving user is the inviting user",
    });
  }
  if (!(await isFriend(gameInviteLinkData.user_from_id, userToId))) {
    return new Response(null, {
      status: 409,
      statusText: "Cannot accept game invites from user who is not your friend",
    });
  }
  return true;
}
