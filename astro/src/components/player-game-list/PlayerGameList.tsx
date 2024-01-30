import { useEffect, useState } from "react";
import type { GetDBGameData } from "../../db/types";
import GameDisplay from "./GameDisplay";

export default function PlayerGameList() {
  const [DBGameDatas, setDBGameDatas] = useState<GetDBGameData[] | null>(null);
  useEffect(function () {
    (async function () {
      const data = await fetch(
        `${import.meta.env.PUBLIC_URL}/api/player-game-list/${"hubwu"}.json`
      ).then((res) => res.json());

      setDBGameDatas(data);
    })();
  }, []);

  return (
    <div>
      {DBGameDatas === null ? (
        <div>Fetching results</div>
      ) : (
        <div className="flex min-h-[100px] w-full flex-row flex-wrap">
          {DBGameDatas.map((DBGameData, i) => (
            <GameDisplay key={i} DBGameData={DBGameData} />
          ))}
        </div>
      )}
    </div>
  );
}
