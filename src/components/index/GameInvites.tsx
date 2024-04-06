import { useState } from "react";
import { type GetDBGameInvite } from "../../db/types";
import GameInviteIndex from "./GameInviteIndex";

interface GameInvitesProps {
  gameInvites: GetDBGameInvite[];
}
export default function GameInvites({ gameInvites }: GameInvitesProps) {
  const [invitesAmount, setInvitesAmount] = useState<number>(
    gameInvites.length
  );
  function substractOneInvite() {
    setInvitesAmount((prev) => prev - 1);
  }
  if (invitesAmount === 0) {
    return <div></div>;
  }
  return (
    <div>
      <h3 className="mb-1 text-center text-xl">Zaproszenia do gier</h3>
      <div className="flex h-[200px] flex-row gap-2 overflow-x-auto overflow-y-hidden sm:h-[250px]">
        {gameInvites.map((invite) => (
          <GameInviteIndex
            key={invite.id}
            gameInvite={invite}
            substractOneInvite={substractOneInvite}
          />
        ))}
      </div>
    </div>
  );
}
