import type {
  APIDeleteGameInvite,
  APIGetGameInvite,
  APIPutGameInvite,
  APIRespPutGameInvite,
} from "../../../db/types";
import GameInviteModalReceive from "./GameInviteModalReceive";

type GameInviteProps = {
  gameInvite: APIGetGameInvite;
  onDelete?: () => void;
  langDict: Record<string, string>;
};

export default function GameInviteReceive({
  gameInvite,
  langDict,
  onDelete,
}: GameInviteProps) {
  async function acceptGameInvite() {
    const data: APIPutGameInvite = {
      inviteId: gameInvite.id,
      userFromId: gameInvite.user_from.id,
    };
    const res = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite/`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
    if (res.ok) {
      onDelete?.();
      const { newGamePath } = (await res.json()) as APIRespPutGameInvite;
      document.location.href = newGamePath;
    }
  }

  async function declineGameInvite() {
    const data: APIDeleteGameInvite = {
      inviteId: gameInvite.id,
    };
    const res = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite/`,
      {
        method: "DELETE",
        body: JSON.stringify(data),
      }
    );
    if (res.ok) {
      onDelete?.();
    }
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
