import type { APIGetOnlineGame } from "../db/types";
import MatchController, {
  type BoardArg,
} from "./chess-classes/board/controller/MatchController";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  getOnlineGame: APIGetOnlineGame
) {
  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: null,
  };

  new MatchController(boardArg, getOnlineGame);
}
