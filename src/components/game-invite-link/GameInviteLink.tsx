import { useEffect, useRef } from "react";
import type { APIRespGetGameInviteLink } from "../../db/types";
import GameInviteLinkReceive from "../game-invite/receive/GameInviteLinkReceive";

type GameInviteLinkProps = {
  gameInviteLinkData: APIRespGetGameInviteLink;
  langDict: Record<string, string>;
};

export default function GameInviteLink({
  gameInviteLinkData,
  langDict,
}: GameInviteLinkProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="rounded-md bg-primary bg-opacity-50 text-white backdrop:bg-zinc-800 backdrop:bg-opacity-55"
    >
      <GameInviteLinkReceive
        gameInvite={gameInviteLinkData}
        langDict={langDict}
      />
    </dialog>
  );
}
