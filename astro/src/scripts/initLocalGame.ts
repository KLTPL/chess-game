import Match, { type BoardArg } from "./chess-classes/Match";

let customStartPos: null | string = null;
// customStartPos = "4k2r/Pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQk - 0 1";

export function initGameLocal(htmlPageContainerQSelector: string) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: customStartPos,
  };
  new Match(boardArg);
}
