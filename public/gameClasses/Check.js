import Pos from "./Pos.js";
import Dir from "./Dir.js";
export default class Check {
    constructor(checkingPiecePos, checkedKingPos, board) {
        this.checkingPiecePos = checkingPiecePos;
        this.checkedKingPos = checkedKingPos;
        this.board = board;
        this.fieldsInBetweenPieceAndKing = this.getFieldsInBetweenCheckingPieceAndKing();
    }
    getFieldsInBetweenCheckingPieceAndKing() {
        if (this.board.el[this.checkingPiecePos.y][this.checkingPiecePos.x].piece.num === this.board.knightNum ||
            this.board.el[this.checkingPiecePos.y][this.checkingPiecePos.x].piece.num === this.board.pawnNum) {
            return [];
        }
        const checkDir = new Dir(this.checkedKingPos.y - this.checkingPiecePos.y, this.checkedKingPos.x - this.checkingPiecePos.x, true);
        let fieldsInBetween = [];
        let tempPos = new Pos(this.checkingPiecePos.y + checkDir.y, this.checkingPiecePos.x + checkDir.x);
        while (tempPos.x !== this.checkedKingPos.x || tempPos.y !== this.checkedKingPos.y) {
            fieldsInBetween.push(new Pos(tempPos.y, tempPos.x));
            tempPos.x += checkDir.x;
            tempPos.y += checkDir.y;
        }
        return fieldsInBetween;
    }
}
