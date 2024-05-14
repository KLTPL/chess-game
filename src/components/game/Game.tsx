import { useEffect } from "react";
import type { APIGetOnlineGame } from "../../db/types";
import type { LangDicts } from "../../scripts-client/chess-classes/board/view/BoardView";
import MatchController, {
  type BoardArg,
} from "../../scripts-client/chess-classes/board/controller/MatchController";

type GameProps = {
  htmlPageContainerQSelector: string;
  getOnlineGame: APIGetOnlineGame | null;
  langDicts: LangDicts;
};

export default function Game({
  getOnlineGame,
  htmlPageContainerQSelector,
  langDicts,
}: GameProps) {
  useEffect(() => {
    const boardArg: BoardArg = {
      htmlPageContainerQSelector,
      customPositionFEN: null,
    };
    new MatchController(boardArg, getOnlineGame, langDicts);
  });
  return <></>;
}
