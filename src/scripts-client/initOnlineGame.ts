import type { APIGetOnlineGame } from "../db/types";
import MatchController, {
  type BoardArg,
} from "./chess-classes/board/controller/MatchController";
import type { LangDicts } from "./chess-classes/board/view/BoardView";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  getOnlineGame: APIGetOnlineGame,
  langDicts: LangDicts
) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: null,
  };

  new MatchController(boardArg, getOnlineGame, langDicts);
}
