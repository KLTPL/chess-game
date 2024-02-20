import { useRef } from "react";
import type { GetDBGameInvite } from "../../db/types";
import type { PutGameInviteResponse } from "../../pages/api/game-invite";

type GameInviteProps = {
  gameInvite: GetDBGameInvite;
};

export default function GameInvite({ gameInvite }: GameInviteProps) {
  const inviteRef = useRef<HTMLDivElement>(null);
  const { id, user_from } = gameInvite;

  async function acceptGameInvite() {
    const res = await fetch(`${import.meta.env.PUBLIC_URL}/api/game-invite/`, {
      method: "PUT",
      body: JSON.stringify({
        inviteId: id,
        userFromId: user_from.id,
      }),
    });
    const { newGamePath } = (await res.json()) as PutGameInviteResponse;
    document.location.href = newGamePath;
  }

  async function declineGameInvite() {
    await fetch(`${import.meta.env.PUBLIC_URL}/api/game-invite/`, {
      method: "DELETE",
      body: JSON.stringify({
        inviteId: id,
      }),
    });
  }

  return (
    <div
      className="grid aspect-square h-full grid-cols-1 grid-rows-3 content-center rounded-md bg-primary p-1 sm:p-3"
      ref={inviteRef}
    >
      <div className="flex flex-row items-center justify-center">
        {user_from.name === user_from.display_name ? (
          <div className="w-full text-center font-semibold">
            {user_from.name}
          </div>
        ) : (
          <>
            <div className="w-1/2 font-semibold">{user_from.name}</div>
            <div className="w-1/2">{user_from.display_name}</div>
          </>
        )}
      </div>
      <div className="text-center">
        Zaprasza cię do gry: <br /> Gra online
      </div>
      <div className="gird-rows-1 grid grid-cols-2">
        <div className="flex items-center justify-center">
          <Button
            key={"1"}
            text="Akceptuj"
            bgClassName="bg-green-600"
            onClick={acceptGameInvite}
            inviteRef={inviteRef}
          />
        </div>
        <div className="flex items-center justify-center">
          <Button
            key={"2"}
            text="Odrzuć"
            bgClassName="bg-red-600"
            onClick={declineGameInvite}
            inviteRef={inviteRef}
          />
        </div>
      </div>
    </div>
  );
}

type ButtonProps = {
  text: string;
  bgClassName: string;
  onClick: () => void;
  inviteRef: React.RefObject<HTMLDivElement>;
};

function Button({ text, bgClassName, onClick, inviteRef }: ButtonProps) {
  return (
    <button
      onClick={() => {
        onClick();
        inviteRef?.current?.remove();
      }}
      className={`${bgClassName} rounded-md px-2 py-1`}
    >
      {text}
    </button>
  );
}
