import Match from "./gameClasses/Match.js";
import { BoardArg } from "./gameClasses/Board.js";
import { PlayerArg } from "./gameClasses/Player.js";
import { TEAMS } from "./gameClasses/Pieces/Piece.js";

let customStartPos: (null|string) = null;
// customStartPos = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
// customStartPos = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1";
// customStartPos ="8/1p3p2/8/K1PqP3/8/8/8/7k b - - 0 1";
// console.log(document.querySelector("body")?.offsetWidth);

export const mouseHold = (element: HTMLElement) => {
  return new Promise<void>((resolve, reject) => {
    element.addEventListener(
      "mouseup", () => {
        reject();
      },
      {once: true}
    );
    setTimeout(() => {
      resolve();
    }, 150);
  });
}

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
    customPositionFEN: customStartPos,
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
