import MatchController, {
  type BoardArg,
} from "./chess-classes/board-components/controller/MatchController";

let customStartPos: null | string = null;
// customStartPos = "4k2r/Pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQk - 0 1";

export function initGameLocal(htmlPageContainerQSelector: string) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: customStartPos,
  };
  new MatchController(boardArg, null);
}
