import { useRef } from "react";
import type {
  APIPostGameInviteLink,
  APIRespPostGameInviteLink,
} from "../../../db/types";
import GameInviteModalCreate from "./GameInviteModalCreate";
import ButtonSecondary from "../../buttons/ButtonSecondary";
import { showNewNotification } from "../../notifications/showNotification";

type GameInviteLinkButtonProps = {
  langDict: Record<string, string>;
};

export default function GameInviteLinkButton({
  langDict,
}: GameInviteLinkButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showGameInviteModal() {
    dialogRef.current?.showModal();
  }
  function closeGameInviteModal() {
    dialogRef.current?.close();
  }
  async function postGameInvite(isUserFromWhite: boolean | null) {
    const data: APIPostGameInviteLink = {
      isUserFromWhite: isUserFromWhite,
    };
    const res = await fetch(`/api/game-invite-link/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    const resObj: APIRespPostGameInviteLink = await res.json();
    if (res.ok) {
      navigator.clipboard.writeText(resObj.inviteLink);
      showNewNotification(
        langDict["invite_link_notification-success"],
        "succes"
      );
    } else {
      showNewNotification(`Error ${res.status}: ${res.statusText}`, "error");
    }

    return res.ok;
  }
  return (
    <>
      <ButtonSecondary
        textContent={langDict["open_button-invite_via_link"]}
        onClick={showGameInviteModal}
      />
      <dialog
        ref={dialogRef}
        className="w-[98vw] rounded-md bg-bg2 py-3 text-white shadow-md backdrop:bg-zinc-900 backdrop:bg-opacity-35 sm:w-[45ch] sm:p-3"
      >
        <GameInviteModalCreate
          closeGameInviteModal={closeGameInviteModal}
          postGameInvite={postGameInvite}
          isGameInviteLink={true}
          langDict={langDict}
        />
      </dialog>
    </>
  );
}
