import type { GetDBGameData } from "../../../db/types";
import GameDisplay from "./GameDisplay";

type PlayerGameListProps = {
  gamesData: GetDBGameData[];
};

export default function PlayerGameList({ gamesData }: PlayerGameListProps) {
  return (
    <div>
      <div className="flex min-h-[100px] w-full flex-row flex-wrap">
        {gamesData.map((DBGameData, i) => (
          <GameDisplay key={i} DBGameData={DBGameData} />
        ))}
      </div>
    </div>
  );
}
