import { useEffect, useState } from "react";
import type { DBGameData } from "../../db/types";
import GameDisplay from "./GameDisplay";

export default function PlayerGameList() {
  const [DBGameDatas, setDBGameDatas] = useState<DBGameData[] | null>(null);
  useEffect(function () {
    (async function () {
      const data = await fetch(
        `${import.meta.env.PUBLIC_PROTOCOL}://${import.meta.env.PUBLIC_HOST}:${import.meta.env.PUBLIC_PORT}/api/player-game-list/${"kltpl"}.json`
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
