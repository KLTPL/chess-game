import Match from "./gameClasses/Match.js";
import { BoardArg, MapOfPiecesForHuman } from "./gameClasses/Board.js";
import { PlayerArg } from "./gameClasses/Player.js";

let customStartPos: (null|MapOfPiecesForHuman) = null;
// customStartPos = [
//   [8,"empty"],
//   ["wpawn",7,"empty"],
//   [8,"empty"],
//   [8,"empty"],
//   [8,"empty"],
//   [4,"empty","bking",3,"empty"],
//   [6,"empty","bpawn","empty"],
//   ["wrook",3,"empty","wking",2,"empty","wrook"],
// ];

function startGame() {
  const player1Arg: PlayerArg = {
    name: "white",
    image: null,
    team: 1,
    timeS: 600,
  };

  const player2Arg: PlayerArg = {
    name: "black",
    image: null,
    team: 2,
    timeS: 600,
  };

  const boardArg: BoardArg = {
    htmlPageContainerQSelector: "[data-container]",
    whiteToPlay: true,
    startPositionsOfPieces: customStartPos,
  };
  new Match(player1Arg, player2Arg, boardArg);
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
