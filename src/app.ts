import Match from "./gameClasses/Match.js";
import { BoardInfo } from "./gameClasses/Board.js";
import { PlayerInfo } from "./gameClasses/Player.js";

let match: Match;
// let custoStartPieces = undefined;
// let custoStartPieces = [
//   [7,"empty",1,"bking"],
//   ["wpawn",7,"empty"],
//   [8,"empty"],
//   [7,"empty",1,"wking"],
//   [8,"empty"],
//   [8,"empty"],
//   [8,"empty"],
//   [7,"empty",1,"bbishop"],
// ];
let custoStartPieces = undefined;

function startGame() {
  const player1Info: PlayerInfo = {
    name: "white noob", 
    image: null, 
    team: 1, 
    timeS: 600
  };

  const player2Info: PlayerInfo = {
    name: "black noob", 
    image: null, 
    team: 1, 
    timeS: 600
  };

  const boardInfo: BoardInfo = {
    htmlQSelector: "[data-board-container]", 
    htmlPageContainerQSelector: "[data-container]", 
    teamPerspectiveNum: 1, 
    startPositionsOfPieces: custoStartPieces
  };
  match = new Match(player1Info, player2Info, boardInfo);
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