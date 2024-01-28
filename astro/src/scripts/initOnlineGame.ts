import type { DBGameData } from "../db/types";
import Match, { type PlayerArg, type BoardArg } from "./chess-classes/Match";

let customStartPos: null | string = null;
// customStartPos = "4k2r/Pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQk - 0 1";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  DBGameData: DBGameData
) {
  console.log(DBGameData);
  const playerWArg: PlayerArg = {
    name: "white",
  };

  const playerBArg: PlayerArg = {
    name: "black",
  };

  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: customStartPos,
  };

  new Match(playerWArg, playerBArg, boardArg);
}
