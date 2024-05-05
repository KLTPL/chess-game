import MatchController, {
  type BoardArg,
} from "./chess-classes/board/controller/MatchController";
import type { LangDicts } from "./chess-classes/board/view/BoardView";

let customStartPos: null | string = null;
// customStartPos = "4k2r/Pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQk - 0 1";

export function initGameLocal(
  htmlPageContainerQSelector: string,
  langDicts: LangDicts
) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: customStartPos,
  };
  return new MatchController(boardArg, null, langDicts);
}
