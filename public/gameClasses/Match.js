import Board from "./Board.js";
import Player from "./Player.js";
import EndType from "./EndType.js";
import Pos from "./Pos.js";
export default class Match {
    constructor(player1Info, player2Info, boardInfo) {
        this.gameRunning = true;
        this.players = {
            white: new Player(player1Info.name, player1Info.image, player1Info.team, player1Info.timeS, this),
            black: new Player(player2Info.name, player2Info.image, player2Info.team, player2Info.timeS, this)
        };
        this.board = new Board(boardInfo.htmlQSelector, boardInfo.htmlPageContainerQSelector, boardInfo.teamPerspectiveNum, this, boardInfo.startPositionsOfPieces);
    }
    checkIfGameShouldEndAfterMove(move) {
        const movingPiecesKing = (move.piece.team === this.board.whiteNum) ? this.board.kings.black : this.board.kings.white;
        let hasMoves = false;
        for (let r = 0; r < this.board.el.length; r++) {
            for (let c = 0; c < this.board.el[r].length; c++) {
                if (this.board.el[r][c].piece.team !== move.piece.enemyTeamNum()) {
                    continue;
                }
                const pieceCanMove = (this.board.el[r][c].piece.getPossibleMovesFromPos(new Pos(r, c)).length === 1) ? false : true;
                if (pieceCanMove) {
                    hasMoves = true;
                    break;
                }
            }
        }
        if (!hasMoves) {
            const cousedBy = (move.piece.team === this.board.whiteNum) ? this.players.white : this.players.black;
            if (movingPiecesKing.checks.length > 0) {
                this.end(new EndType(cousedBy, "check-mate"));
            }
        }
    }
    end(endType) {
        this.gameRunning = false;
        console.log(`Game has ended by ${endType.cousedBy.name} with a ${endType.type}`);
    }
}
