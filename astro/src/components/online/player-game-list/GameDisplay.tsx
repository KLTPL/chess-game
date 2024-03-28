import { type GetDBGameData } from "../../../db/types.ts";

type GameDisplayProps = {
  DBGameData: GetDBGameData;
};

export default function GameDisplay({ DBGameData }: GameDisplayProps) {
  return (
    <div className="flex h-full w-1/4 min-w-[200px] flex-col bg-red-700">
      <div>
        {DBGameData.game.user_w_display_name} vs{" "}
        {DBGameData.game.user_b_display_name}
      </div>
      <div>
        <a href={`/online-game/${DBGameData.game.display_id}`}>Zobacz grę</a>
      </div>
    </div>
  );
}
