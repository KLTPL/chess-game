import Pos from "./Pos.js";
export default class Player {
    constructor(name, image, team, timeS, board) {
        this.name = name;
        this.image = image;
        this.team = team;
        this.points = 0;
        this.timeS = timeS;
        this.board = board;
    }
    countsPoints() {
        const board = this.board;
        this.points = 0;
        for (let r = 0; r < board.el.length; r++) {
            for (let c = 0; c < board.el[r].length; c++) {
                if (board.el[r][c].piece.team === this.team) {
                    this.points += board.el[r][c].piece.value;
                }
            }
        }
    }
    enemyTeamNum() {
        return (this.team === this.board.whiteNum) ? this.board.blackNum : this.board.whiteNum;
    }
    hasMoves() {
        const boardEl = this.board.el;
        for (let r = 0; r < boardEl.length; r++) {
            for (let c = 0; c < boardEl[r].length; c++) {
                if (boardEl[r][c].piece.team !== this.enemyTeamNum()) {
                    continue;
                }
                const pieceCanMove = (boardEl[r][c].piece.getPossibleMovesFromPos(new Pos(r, c)).length === 1) ? false : true;
                if (pieceCanMove) {
                    return true;
                }
            }
        }
        return false;
    }
}
