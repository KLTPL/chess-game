import Piece from "./Piece";
import Pos from "../Pos";
import Dir from "../Dir";
export default class Queen extends Piece {
    constructor(team, html, board) {
        super(team, html, board);
        this.num = 5;
        this.value = 9;
    }
    getPossibleMovesFromPosForKing(pos) {
        const enemyTeamNum = this.enemyTeamNum();
        let possibleMoves = [];
        let tempPos;
        let directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        for (let dir of directions) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (this.board.el[tempPos.y][tempPos.x].piece.team === enemyTeamNum &&
                    this.board.el[tempPos.y][tempPos.x].piece.num !== this.board.kingNum) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if (tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
                if (this.board.el[tempPos.y][tempPos.x].piece.team === this.team) {
                    break;
                }
            }
        }
        ;
        return possibleMoves;
    }
    getPossibleMovesFromPos(pos) {
        let possibleMoves = [pos];
        let tempPos;
        let directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        for (let dir of directions) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (this.board.el[tempPos.y][tempPos.x].piece.team !== null &&
                    this.board.el[tempPos.y][tempPos.x].piece.team !== this.team) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if ((tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) ||
                    this.board.el[tempPos.y][tempPos.x].piece.team === this.team) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
            }
        }
        ;
        const myKing = (this.team === this.board.whiteNum) ? this.board.kings.white : this.board.kings.black;
        const absPins = myKing.getPossitionsOfAbsolutePins();
        possibleMoves = this.substraktAbsPinsFromPossMoves(possibleMoves, absPins, pos);
        return possibleMoves;
    }
}
