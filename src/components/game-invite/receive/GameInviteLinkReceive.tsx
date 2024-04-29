import type {
  APIDeleteGameInviteLink,
  APIPutGameInviteLink,
  APIRespGetGameInviteLink,
  APIRespPutGameInviteLink,
} from "../../../db/types";
import GameInviteModalReceive from "./GameInviteModalReceive";

type GameInviteProps = {
  gameInvite: APIRespGetGameInviteLink;
  langDict: Record<string, string>;
};

export default function GameInviteLinkReceive({
  gameInvite,
  langDict,
}: GameInviteProps) {
  async function acceptGameInvite() {
    const data: APIPutGameInviteLink = {
      id: gameInvite.id,
    };
    const response = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite-link/`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (response.ok) {
      const getOnlineGame: APIRespPutGameInviteLink = await response.json();
      window.location.replace(getOnlineGame.newGamePath);
    } else {
      window.location.replace("/");
    }
  }

  async function declineGameInvite() {
    const data: APIDeleteGameInviteLink = {
      id: gameInvite.id,
    };
    await fetch(`${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite-link/`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
    window.location.replace("/");
  }

  return (
    <GameInviteModalReceive
      langDict={langDict}
      gameInvite={gameInvite}
      acceptGameInvite={acceptGameInvite}
      declineGameInvite={declineGameInvite}
    />
  );
}
