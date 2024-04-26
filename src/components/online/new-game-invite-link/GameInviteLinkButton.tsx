import { useRef } from "react";
import type {
  APIPostGameInviteLink,
  APIRespPostGameInviteLink,
} from "../../../db/types";
import GameInviteModal from "../../game-invite/create/GameInviteModal";
import ButtonSecondary from "../../buttons/ButtonSecondary";
import { showNewNotification } from "../../notifications/showNotification";

export default function GameInviteLinkButton() {
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
    const res = await fetch(
      `${import.meta.env.PUBLIC_SERVER_URL}/api/game-invite-link/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const resObj: APIRespPostGameInviteLink = await res.json();
    if (res.ok) {
      navigator.clipboard.writeText(resObj.inviteLink);
      showNewNotification(
        "Skopiowano link. Zaproszenie będzie dostępne przez 15 minut",
        "succes"
      );
    } else {
      showNewNotification(`Bład ${res.status}: ${res.statusText}`, "error");
    }

    return res.ok;
  }
  return (
    <>
      <ButtonSecondary
        textContent="Zaproś poprzez link"
        onClick={showGameInviteModal}
      />
      <dialog
        ref={dialogRef}
        className="w-[98vw] rounded-md bg-bg2 py-3 text-white shadow-md backdrop:bg-zinc-900 backdrop:bg-opacity-35 sm:w-[45ch] sm:p-3"
      >
        <GameInviteModal
          closeGameInviteModal={closeGameInviteModal}
          postGameInvite={postGameInvite}
          isGameInviteLink={true}
        />
      </dialog>
    </>
  );
}
