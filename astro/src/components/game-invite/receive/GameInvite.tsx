import { useRef } from "react";
import type {
  GetDBGameInvite,
  GetResponseGameInviteLink,
} from "../../../db/types";
import bothColorsKing from "../../../images/both-colors-king.png";
import whiteKing from "../../../images/w-king.png";
import blackKing from "../../../images/b-king.png";

type GameInviteProps = {
  gameInvite: GetDBGameInvite | GetResponseGameInviteLink;
  accept: () => Promise<void>;
  decline: () => Promise<void>;
};

export default function GameInvite({
  gameInvite,
  accept,
  decline,
}: GameInviteProps) {
  const inviteRef = useRef<HTMLDivElement>(null);
  const { user_from, is_user_from_white } = gameInvite;

  let teamSrc: string;
  let alt: string;
  if (is_user_from_white === null) {
    teamSrc = bothColorsKing.src;
    alt = "random team image";
  } else if (is_user_from_white === true) {
    teamSrc = blackKing.src;
    alt = "black team image";
  } else {
    teamSrc = whiteKing.src;
    alt = "white team image";
  }

  return (
    <div
      className="flex aspect-square h-full flex-col  content-center rounded-md bg-primary p-1 sm:p-3"
      ref={inviteRef}
    >
      <div className="grid grid-cols-1 grid-rows-2">
        <div className="grid place-content-center">
          <h5 className="font-bold">Zaproszenie:</h5>
        </div>
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
      </div>
      <div className="grid grid-cols-1 grid-rows-2">
        <div className="flex flex-col items-center">
          <div className="flex flex-row justify-center gap-1">
            {/* flex flex-row justify-center gap-1 */}
            <div>Typ gry:</div>
            <div>Gra online</div>
          </div>
          <div className="flex flex-row justify-center gap-1">
            <div className="flex items-center justify-center">Twój team:</div>
            <div className="flex h-[40px] items-center justify-center">
              <img src={teamSrc} alt={alt} className="aspect-square h-full" />
            </div>
          </div>
        </div>
        <div className="gird-rows-1 grid grid-cols-2">
          <div className="flex items-center justify-center">
            <Button
              key={"1"}
              text="Akceptuj"
              bgClassName="bg-green-600"
              onClick={accept}
              inviteRef={inviteRef}
            />
          </div>
          <div className="flex items-center justify-center">
            <Button
              key={"2"}
              text="Odrzuć"
              bgClassName="bg-red-600"
              onClick={decline}
              inviteRef={inviteRef}
            />
          </div>
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
