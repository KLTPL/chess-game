import type { GetOnlineGame } from "../pages/api/online-game/[display_id].json";
import MatchController, {
  type BoardArg,
} from "./chess-classes/board-components/controller/MatchController";

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
