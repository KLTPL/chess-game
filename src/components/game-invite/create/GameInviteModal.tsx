import { useState, type SetStateAction } from "react";
import type { GetDBAppUser } from "../../../db/types";
import bothColorsKing from "../../../images/both-colors-king.png";
import whiteKing from "../../../images/w-king.png";
import blackKing from "../../../images/b-king.png";

type GameInviteModalProps = {
  user?: GetDBAppUser;
  closeGameInviteModal: () => void;
  postGameInvite: (isUserFromWhite: boolean | null) => Promise<boolean>;
  textContent: string;
};

export default function GameInviteModal({
  user,
  closeGameInviteModal,
  postGameInvite,
  textContent,
}: GameInviteModalProps) {
  const [isUserFromWhite, setIsUserFromWhite] = useState<null | boolean>(null);

  return (
    <>
      <button
        className="absolute right-0 top-0 z-10 aspect-square bg-current font-bold sm:me-2 sm:mt-2"
        onClick={() => {
          setIsUserFromWhite(null);
          closeGameInviteModal();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          className="bg-bg2"
          viewBox="0 0 16 16"
        >
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
      </button>
      <div className="relative flex flex-col items-center justify-center">
        <div className="flex h-full w-full flex-col gap-3">
          {user !== undefined && (
            <div className="flex w-full flex-col items-center">
              <h6 className="text-lg font-bold">Użytkownik:</h6>
              <div className="flex w-full flex-row justify-evenly">
                <div className="font-semibold">{user.display_name}</div>
                <div>@{user.name}</div>
              </div>
            </div>
          )}
          <div className="flex flex-col items-center">
            <h6 className="text-lg font-bold ">Zasady:</h6>
            <div className="flex flex-col sm:grid-cols-2 sm:grid-rows-2 md:grid">
              <div className="flex items-center justify-center font-semibold">
                Czas:
              </div>
              <div className="flex items-center justify-center">
                Kiedyś będzie
              </div>
              <div className="flex items-center justify-center font-semibold">
                Team:
              </div>
              <div className="flex flex-row justify-evenly">
                <TeamSettingButton
                  contentPath={bothColorsKing.src}
                  alt="Random team button"
                  isUserFromWhite={isUserFromWhite}
                  setIsUserFromWhite={(
                    value: SetStateAction<null | boolean>
                  ) => {
                    setIsUserFromWhite(value);
                  }}
                  valToSet={null}
                />
                <TeamSettingButton
                  contentPath={whiteKing.src}
                  alt="White team button"
                  isUserFromWhite={isUserFromWhite}
                  setIsUserFromWhite={(
                    value: SetStateAction<null | boolean>
                  ) => {
                    setIsUserFromWhite(value);
                  }}
                  valToSet={true}
                />
                <TeamSettingButton
                  contentPath={blackKing.src}
                  alt="Black team button"
                  isUserFromWhite={isUserFromWhite}
                  setIsUserFromWhite={(
                    value: SetStateAction<null | boolean>
                  ) => {
                    setIsUserFromWhite(value);
                  }}
                  valToSet={false}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-center">
            <button
              className="rounded-md bg-secondary px-4 py-2 text-white hover:bg-secondary-d"
              onClick={async () => {
                const ok = await postGameInvite(isUserFromWhite);
                if (ok) {
                  setIsUserFromWhite(null);
                  closeGameInviteModal();
                }
              }}
            >
              {textContent}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

type TeamSettingButtonProps = {
  contentPath: string;
  alt: string;
  isUserFromWhite: boolean | null;
  setIsUserFromWhite: (value: React.SetStateAction<boolean | null>) => void;
  valToSet: boolean | null;
};

function TeamSettingButton({
  contentPath,
  alt,
  isUserFromWhite,
  setIsUserFromWhite,
  valToSet,
}: TeamSettingButtonProps) {
  let className = "";
  if (isUserFromWhite === valToSet) {
    className += "bg-secondary-b";
  }
  return (
    <button
      className={className + " aspect-square w-1/4 rounded-md "}
      onClick={() => setIsUserFromWhite(valToSet)}
    >
      <img
        src={contentPath}
        alt={alt}
        className="aspect-square h-full max-w-[100px] sm:max-w-[200px]"
      />
    </button>
  );
}
