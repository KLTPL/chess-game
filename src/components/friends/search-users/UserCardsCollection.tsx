import type { APIGetAppUser } from "../../../db/types";
import UserCard, { type ButtonInfo } from "./UserCard";

type UserCardsCollectionProps = {
  title: string;
  users: APIGetAppUser[] | undefined;
  buttons: ButtonInfo[];
  isGameInviteButton?: true;
};

export default function UserCardsCollection({
  title,
  users,
  buttons,
  isGameInviteButton,
}: UserCardsCollectionProps) {
  if (users?.length === 0) {
    return <div></div>;
  }
  return (
    <div className="mt-2 flex flex-col gap-1">
      <h6 className="text-xl text-white">{title}</h6>
      <div className="flex flex-col gap-1">
        {users?.map((user) => (
          <UserCard
            key={user.name}
            user={user}
            buttons={buttons}
            isGameInviteButton={isGameInviteButton}
          />
        ))}
      </div>
    </div>
  );
}
