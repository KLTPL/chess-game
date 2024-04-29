import { useState } from "react";
import { type APIGetGameInvite } from "../../db/types";
import GameInviteReceive from "../game-invite/receive/GameInviteReceive";

interface GameInvitesProps {
  gameInvites: APIGetGameInvite[];
  header: string;
  langDictGameInviteReceive: Record<string, string>;
}
export default function GameInvites({
  gameInvites,
  header,
  langDictGameInviteReceive,
}: GameInvitesProps) {
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
      <h3 className="mb-1 text-center text-xl">{header}</h3>
      <div className="flex h-[200px] flex-row gap-2 overflow-x-auto overflow-y-hidden sm:h-[250px]">
        {gameInvites.map((invite) => (
          <GameInviteReceive
            key={invite.id}
            gameInvite={invite}
            onDelete={substractOneInvite}
            langDict={langDictGameInviteReceive}
          />
        ))}
      </div>
    </div>
  );
}
