import { useEffect, useRef } from "react";
import GameInvite from "../game-invite/receive/GameInvite";
import type {
  APIDeleteGameInviteLink,
  APIRespGetGameInviteLink,
  APIPutGameInviteLink,
  APIRespPutGameInviteLink,
} from "../../db/types";

type GameInviteLinkProps = {
  gameInviteLinkData: APIRespGetGameInviteLink;
};

export default function GameInviteLink({
  gameInviteLinkData,
}: GameInviteLinkProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  async function acceptGameInvite() {
    const data: APIPutGameInviteLink = {
      id: gameInviteLinkData.id,
    };
    const response = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite-link/`,
      { method: "PUT", body: JSON.stringify(data) }
    );
    if (!response.ok) {
      window.location.replace("/404");
    } else {
      const getOnlineGame: APIRespPutGameInviteLink = await response.json();
      window.location.replace(getOnlineGame.newGamePath);
    }
  }

  async function declineGameInvite() {
    const data: APIDeleteGameInviteLink = {
      id: gameInviteLinkData.id,
    };
    await fetch(`${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite-link/`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
    window.location.replace("/");
  }
  return (
    <dialog
      ref={dialogRef}
      className="rounded-md bg-primary bg-opacity-50 text-white backdrop:bg-zinc-800 backdrop:bg-opacity-55"
    >
      <GameInvite
        accept={acceptGameInvite}
        decline={declineGameInvite}
        gameInvite={gameInviteLinkData}
      />
    </dialog>
  );
}
