import type { GetOnlineGame } from "../db/types";
import MatchController, {
  type BoardArg,
} from "./chess-classes/board/controller/MatchController";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  getOnlineGame: GetOnlineGame
) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: null,
  };

  new MatchController(boardArg, getOnlineGame);
}
