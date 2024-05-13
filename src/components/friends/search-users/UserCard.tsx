import type { UseMutateFunction } from "react-query";
import type { APIGetAppUser } from "../../../db/types";
import GameInviteButton from "../../game-invite/create/GameInviteCreate";
import ButtonPrimary from "../../buttons/ButtonPrimary";
import ButtonSecondary from "../../buttons/ButtonSecondary";

export type ButtonInfo = {
  onClick: UseMutateFunction<void, unknown, string, unknown>;
  text: string;
  isSecondary?: true;
};

type FriendCardProps = {
  user: APIGetAppUser;
  buttons: ButtonInfo[];
  isGameInviteButton?: true;
  langDictGameInviteCreate: Record<string, string>;
};

export default function UserCard({
  user,
  buttons,
  isGameInviteButton,
  langDictGameInviteCreate,
}: FriendCardProps) {
  return (
    <div className="flex flex-row items-center justify-stretch rounded-md bg-bg4 p-2 text-black shadow-sm shadow-black">
      <div className="flex w-1/2 flex-row text-sm sm:text-base">
        <div
          className="w-1/2 overflow-hidden text-center font-semibold"
          style={{
            // add 3 dots if too large
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={user.display_name}
        >
          {user.display_name}
        </div>
        <div
          className="w-1/2 overflow-hidden text-center"
          style={{
            // add 3 dots if too large
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={`@${user.name}`}
        >
          @{user.name}
        </div>
      </div>

      <div className="flex w-1/2 flex-row justify-end gap-1 text-sm sm:me-5 sm:text-base">
        {isGameInviteButton === true && (
          <GameInviteButton user={user} langDict={langDictGameInviteCreate} />
        )}
        {buttons.map(({ text, onClick, isSecondary }) =>
          isSecondary === true ? (
            <ButtonSecondary
              key={text}
              textContent={text}
              onClick={() => onClick(user.id)}
            />
          ) : (
            <ButtonPrimary
              key={text}
              textContent={text}
              onClick={() => onClick(user.id)}
            />
          )
        )}
      </div>
    </div>
  );
}
