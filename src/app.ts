import Match from "./gameClasses/Match.js";
import { BoardArg, MapOfPiecesForHuman } from "./gameClasses/Board.js";
import { PlayerArg } from "./gameClasses/Player.js";
import { TEAMS } from "./gameClasses/Pieces/Piece.js";

let customStartPos: (null|MapOfPiecesForHuman) = null;
customStartPos = [
  [8,"empty"],
  [2,"empty","bpawn",5,"empty"],
  [3,"empty","bpawn",4,"empty"],
  ["wking","wpawn",4,"empty","wrook","brook"],
  [8,"empty"],
  [4,"empty","bking",3,"empty"],
  ["wpawn",5,"empty","bpawn","empty"],
  [8,"empty"],

];
console.log(document.querySelector("body")?.offsetWidth)
function startGame() {
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
