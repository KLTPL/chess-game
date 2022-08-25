import Board from "./Board.js";
import Player from "./Player.js";
export default class Match {
    constructor(player1Info, player2Info, boardInfo) {
        this.gameRunning = true;
        this.players = {
            white: new Player(player1Info.name, player1Info.image, player1Info.team, player1Info.timeS, this),
            black: new Player(player2Info.name, player2Info.image, player2Info.team, player2Info.timeS, this)
        };
        this.board = new Board(boardInfo.htmlQSelector, boardInfo.htmlPageContainerQSelector, boardInfo.teamPerspectiveNum, this, boardInfo.startPositionsOfPieces);
    }
    end(endType) {
        this.gameRunning = false;
        console.log(`Game has ended by ${endType.cousedBy.name} with a ${endType.type}`);
    }
}
