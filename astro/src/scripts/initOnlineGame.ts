import type { GetDBGameData } from "../db/types";
import Match, { type BoardArg } from "./chess-classes/Match";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  DBGameData: GetDBGameData
) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: null,
  };

  new Match(boardArg, DBGameData);
}
