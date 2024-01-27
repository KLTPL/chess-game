import Match, { type PlayerArg, type BoardArg } from "../gameClasses/Match";

let customStartPos: null | string = null;
// customStartPos = "4k2r/Pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQk - 0 1";

export function initGameOnline(
  htmlPageContainerQSelector: string,
  nameW: string,
  nameB: string
) {
  const playerWArg: PlayerArg = {
    name: nameW,
  };

  const playerBArg: PlayerArg = {
    name: nameB,
  };

  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: customStartPos,
  };

  new Match(playerWArg, playerBArg, boardArg);
}
