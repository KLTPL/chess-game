import Board from "./gameClasses/Board";

let board: Board;

function startGame() {
  board = new Board("[data-board-container]", "[data-container]");
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