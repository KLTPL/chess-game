import Match from "./gameClasses/Match.js";
import { BoardArg, MapOfPiecesForHuman } from "./gameClasses/Board.js";
import { PlayerArg } from "./gameClasses/Player.js";

let customStartPos: undefined | MapOfPiecesForHuman = undefined;
// customStartPos = [
//   ["empty","bking",6,"empty"],
//   [8,"empty",],
//   [8,"empty"],
//   [7,"empty","bbishop"],
//   [8,"empty"],
//   [8,"empty"],
//   [8,"empty"],
//   [7,"empty","wking"],
// ];

function startGame() {
  const player1Info: PlayerArg = {
    name: "white",
    image: null,
    team: 1,
    timeS: 600,
  };

  const player2Info: PlayerArg = {
    name: "black",
    image: null,
    team: 2,
    timeS: 600,
  };

  const boardInfo: BoardArg = {
    htmlQSelector: "[data-board-container]",
    htmlPageContainerQSelector: "[data-container]",
    startPositionsOfPieces: customStartPos,
  };
  new Match(player1Info, player2Info, boardInfo);
}

startGame();

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
