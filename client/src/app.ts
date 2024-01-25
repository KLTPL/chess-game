import Match, { type PlayerArg, type BoardArg } from "./gameClasses/Match";
import { TEAMS } from "./gameClasses/pieces/Piece";

let customStartPos: null | string = null;
// customStartPos = "4k2r/Pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";

export function startGame(htmlPageContainerQSelector: string) {
  const player1Arg: PlayerArg = {
    name: "white",
    image: null,
    team: TEAMS.WHITE,
    timeS: 600,
  };

  const player2Arg: PlayerArg = {
    name: "black",
    image: null,
    team: TEAMS.BLACK,
    timeS: 600,
  };

  const boardArg: BoardArg = {
    htmlPageContainerQSelector,
    customPositionFEN: customStartPos,
  };
  new Match(player1Arg, player2Arg, boardArg);
}

// function getRandomColor() {
//   switch(Math.floor(Math.random()*9)) {
//     case 0: return "red";
//     case 1: return "blue";
//     case 2: return "green";
//     case 3: return "yellow";
//     case 4: return "black";
//     case 5: return "pink";
//     case 6: return "orange";
//     case 6: return "brown";
//     case 7: return "purple";
//     case 8: return "gray";
//   }
// }
