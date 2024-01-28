import type { DBGameData } from "../db/types";
import Match, { type BoardArg } from "./chess-classes/Match";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  DBGameData: DBGameData
) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: null,
  };

  new Match(boardArg, DBGameData);
}
