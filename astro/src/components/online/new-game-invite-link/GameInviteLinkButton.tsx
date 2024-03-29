import { useRef } from "react";
import type {
  PostGameInviteLink,
  PostResultGameInviteLink,
} from "../../../db/types";
import GameInviteModal from "../../game-invite/create/GameInviteModal";

export default function GameInviteLinkButton() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showGameInviteModal() {
    dialogRef.current?.showModal();
  }
  function closeGameInviteModal() {
    dialogRef.current?.close();
  }
  async function postGameInvite(isUserFromWhite: boolean | null) {
    const data: PostGameInviteLink = {
      isUserFromWhite: isUserFromWhite,
    };
    const res = await fetch(
      `${import.meta.env.PUBLIC_URL}/api/game-invite-link/`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const resObj: PostResultGameInviteLink = await res.json();
    if (res.ok) {
      window.alert(
        "Skopiowano link. Zaproszenie będzie dostępne przez 15 minut"
      );
    }

    navigator.clipboard.writeText(resObj.inviteLink);
    return res.ok;
  }
  return (
    <>
      <button
        className="rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary-d"
        onClick={showGameInviteModal}
      >
        Zaproś poprzez link
      </button>
      <dialog
        ref={dialogRef}
        className="w-[98vw] rounded-md bg-bg2 py-3 text-white backdrop:bg-zinc-900 backdrop:bg-opacity-35 sm:w-[45ch] sm:p-3"
      >
        <GameInviteModal
          closeGameInviteModal={closeGameInviteModal}
          postGameInvite={postGameInvite}
          textContent="Kopiuj link"
        />
      </dialog>
    </>
  );
}
