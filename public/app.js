import Match from "./gameClasses/Match.js";
let match;
// let custoStartPieces = undefined;
let custoStartPieces = [
    ["brook", 3, "empty", "bking", 2, "empty", "brook"],
    [8, "bpawn"],
    [8, "empty"],
    [8, "empty"],
    [8, "empty"],
    [8, "empty"],
    [8, "wpawn"],
    ["wrook", 3, "empty", "wking", 2, "empty", "wrook"],
];
function startGame() {
    const player1Info = {
        name: "white noob",
        image: null,
        team: 1,
        timeS: 600
    };
    const player2Info = {
        name: "black noob",
        image: null,
        team: 1,
        timeS: 600
    };
    const boardInfo = {
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
