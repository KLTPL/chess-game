import type {
  DeleteGameInvite,
  GetDBGameInvite,
  PutGameInvite,
  PutResponseGameInvite,
} from "../../db/types";
import GameInvite from "../game-invite/receive/GameInvite";
type GameInviteProps = {
  gameInvite: GetDBGameInvite;
  substractOneInvite: () => void;
};

export default function GameInviteIndex({
  gameInvite,
  substractOneInvite,
}: GameInviteProps) {
  async function acceptGameInvite() {
    substractOneInvite();
    const data: PutGameInvite = {
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
    const { newGamePath } = (await res.json()) as PutResponseGameInvite;
    document.location.href = newGamePath;
  }

  async function declineGameInvite() {
    substractOneInvite();
    const data: DeleteGameInvite = {
      inviteId: gameInvite.id,
    };
    await fetch(`${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite/`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }

  return (
    <GameInvite
      gameInvite={gameInvite}
      accept={acceptGameInvite}
      decline={declineGameInvite}
    />
  );
}
