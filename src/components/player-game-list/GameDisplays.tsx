import { useRef, useState } from "react";
import { type APIGetGameData, type APIGetUserGames } from "../../db/types";
import GameDisplay from "./GameDisplay";

async function fetchPlayerGames(
  data: APIGetUserGames
): Promise<APIGetGameData[] | null> {
  const res = await fetch(
    `/api/user-games/${data.id}/${data.startIdx}-${data.endIdx}`,
    {
      method: "GET",
    }
  );
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as APIGetGameData[];
}

export type OlderGameDisplaysProps = {
  initGamesData: APIGetGameData[];
  playerId: string;
  startIdx: number;
  incrementBy: number;
  loadMoreOnScroll: boolean;
  langDictGameList: Record<string, string>;
};

export default function GameDisplays({
  initGamesData,
  playerId,
  startIdx: initStartIdx,
  incrementBy,
  loadMoreOnScroll: initLoadMore,
  langDictGameList,
}: OlderGameDisplaysProps) {
  const [gamesData, setGamesData] = useState<APIGetGameData[]>(initGamesData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const loadMoreRef = useRef<boolean>(initLoadMore);
  const startIdx = useRef<number>(initStartIdx);

  async function getNewGamesData(): Promise<APIGetGameData[]> {
    if (startIdx.current === 0) {
      return [];
    }
    const newGames = await fetchPlayerGames({
      startIdx: startIdx.current,
      endIdx: startIdx.current + incrementBy,
      id: playerId,
    });
    if (newGames === null) {
      return [];
    }
    return newGames;
  }
  async function handleScroll() {
    if (!loadMoreRef.current) {
      return;
    }
    const windowHeight = window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const bottomThreshold = totalHeight - windowHeight;

    if (scrollPosition >= bottomThreshold) {
      setIsLoading(true);
      startIdx.current += incrementBy;
      const newGamesData = await getNewGamesData();
      setIsLoading(false);
      if (newGamesData.length < incrementBy) {
        loadMoreRef.current = false;
      }
      setGamesData((prev) => [...prev, ...newGamesData]);
    }
  }
  window.addEventListener("scroll", handleScroll);
  return (
    <div className="flex flex-col">
      {gamesData.map((DBGameData, i) => (
        <GameDisplay
          key={i}
          DBGameData={DBGameData}
          borderBottom={i !== gamesData.length - 1}
          borderTop={i !== 0}
          langDictGameList={langDictGameList}
        />
      ))}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 bg-primary-b p-3">
          <div className="animate-spin">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              className="bi bi-arrow-clockwise"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
              />
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
