import type { UseMutateFunction } from "react-query";
import type { GetDBAppUser } from "../../../db/types";

export type ButtonInfo = {
  onClick: UseMutateFunction<void, unknown, string, unknown>;
  text: string;
};

type FriendCardProps = {
  user: GetDBAppUser;
  buttons: ButtonInfo[];
};

export default function UserCard({ user, buttons }: FriendCardProps) {
  async function postGameInvite() {
    const res = await fetch(`${import.meta.env.PUBLIC_URL}/api/game-invite/`, {
      method: "POST",
      body: JSON.stringify({
        userToId: user.id,
      }),
    });
    if (res.ok) {
      window.alert("Zaproszenie wysłane");
    }
  }
  return (
    <div className="flex flex-row items-center justify-stretch rounded-md bg-bg3 p-2 text-black shadow-sm shadow-black">
      {user.name === user.display_name ? (
        <div className="w-1/2 text-center font-bold">{user.name}</div>
      ) : (
        <div className="flex w-1/2 flex-row">
          <div className="w-1/2 text-center font-bold">{user.name}</div>
          <div className="w-1/2 text-center">{user.display_name}</div>
        </div>
      )}
      <div className="me-5 flex w-1/2 flex-row justify-end gap-1">
        {buttons.map(({ text, onClick }) => (
          <button
            key={text}
            className="rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-d"
            onClick={() => onClick(user.id)}
          >
            {text}
          </button>
        ))}
        <button
          className="rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary-d"
          onClick={postGameInvite}
        >
          Zagraj
        </button>
      </div>
    </div>
  );
}
