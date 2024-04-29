import { useRef } from "react";
import type { APIGetAppUser, APIPostGameInvite } from "../../../db/types";
import GameInviteModalCreate from "./GameInviteModalCreate";
import { showNewNotification } from "../../notifications/showNotification";

type GameInviteLinkButtonProps = {
  langDict: Record<string, string>;
  user: APIGetAppUser;
};

export default function GameInviteButton({
  langDict,
  user,
}: GameInviteLinkButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showGameInviteModal() {
    dialogRef.current?.showModal();
  }
  function closeGameInviteModal() {
    dialogRef.current?.close();
  }
  async function postGameInvite(isUserFromWhite: boolean | null) {
    const data: APIPostGameInvite = {
      userToId: user.id,
      isUserFromWhite: isUserFromWhite,
    };
    const res = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    if (res.ok) {
      showNewNotification(langDict["invite_notification-success"], "succes");
    } else {
      showNewNotification(`Error ${res.status}: ${res.statusText}`, "error");
    }
    return res.ok;
  }
  return (
    <>
      <button
        className="rounded-md bg-secondary px-2 py-1 text-white hover:bg-secondary-d md:px-4 md:py-2"
        onClick={showGameInviteModal}
      >
        {langDict["open_button-play"]}
      </button>
      <dialog
        ref={dialogRef}
        className="w-[98vw] rounded-md bg-bg2 py-3 text-white backdrop:bg-zinc-900 backdrop:bg-opacity-35 sm:w-[45ch] sm:p-3"
      >
        <GameInviteModalCreate
          user={user}
          closeGameInviteModal={closeGameInviteModal}
          postGameInvite={postGameInvite}
          isGameInviteLink={false}
          langDict={langDict}
        />
      </dialog>
    </>
  );
}
