import type { UseMutateFunction } from "react-query";
import type { GetDBAppUser, PostGameInvite } from "../../../db/types";
import { useRef, useState } from "react";
import GameInviteModal from "../../game-invite/create/GameInviteModal";

export type ButtonInfo = {
  onClick: UseMutateFunction<void, unknown, string, unknown>;
  text: string;
};

type FriendCardProps = {
  user: GetDBAppUser;
  buttons: ButtonInfo[];
  isGameInviteButton?: true;
};

export default function UserCard({
  user,
  buttons,
  isGameInviteButton,
}: FriendCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  function showGameInviteModal() {
    dialogRef.current?.showModal();
  }
  function closeGameInviteModal() {
    dialogRef.current?.close();
  }
  async function postGameInvite(isUserFromWhite: boolean | null) {
    const data: PostGameInvite = {
      userToId: user.id,
      isUserFromWhite: isUserFromWhite,
    };
    const res = await fetch(`${import.meta.env.PUBLIC_URL}/api/game-invite/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      window.alert("Wysłanie zaproszenia nie powiodło się");
    }
    return res.ok;
  }
  return (
    <div className="flex flex-row items-center justify-stretch rounded-md bg-bg4 p-2 text-black shadow-sm shadow-black">
      {user.name === user.display_name ? (
        <div className="w-1/2 text-center font-bold">{user.name}</div>
      ) : (
        <div className="flex w-1/2 flex-row">
          <div className="w-1/2 text-center font-bold">{user.name}</div>
          <div className="w-1/2 text-center">{user.display_name}</div>
        </div>
      )}
      <div className="me-5 flex w-1/2 flex-row justify-end gap-1">
        {isGameInviteButton === true && (
          <button
            className="rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary-d"
            onClick={showGameInviteModal}
          >
            Zagraj
          </button>
        )}
        {buttons.map(({ text, onClick }) => (
          <button
            key={text}
            className="rounded-md bg-primary-b px-4 py-2 text-white hover:bg-primary"
            onClick={() => onClick(user.id)}
          >
            {text}
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className="w-[98vw] rounded-md bg-bg2 py-3 text-white backdrop:bg-zinc-900 backdrop:bg-opacity-35 sm:w-[45ch] sm:p-3"
      >
        <GameInviteModal
          user={user}
          closeGameInviteModal={closeGameInviteModal}
          postGameInvite={postGameInvite}
          textContent="Zaproś"
        />
      </dialog>
    </div>
  );
}
