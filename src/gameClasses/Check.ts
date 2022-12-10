import Pos from "./Pos.js";
import Board from "./Board.js";
import Dir from "./Dir.js";
import { PIECES } from "./Pieces/Piece.js";

export default class Check {
  checkingPiecePos: Pos;
  checkedKingPos: Pos;
  board: Board;
  fieldsInBetweenPieceAndKing: Pos[];
  constructor(checkingPiecePos: Pos, checkedKingPos: Pos, board: Board) {
    this.checkingPiecePos = checkingPiecePos;
    this.checkedKingPos = checkedKingPos;
    this.board = board;
    this.fieldsInBetweenPieceAndKing = this.getFieldsInBetweenCheckingPieceAndKing();

  }

  getFieldsInBetweenCheckingPieceAndKing() {
    const checkingPiece = this.checkingPiecePos;
    if( 
      this.board.el[checkingPiece.y][checkingPiece.x].piece?.num === PIECES.knight ||
      this.board.el[checkingPiece.y][checkingPiece.x].piece?.num === PIECES.pawn
    ) {
      return [];
    }
    const checkDir = new Dir(
      this.checkedKingPos.y - checkingPiece.y, 
      this.checkedKingPos.x - checkingPiece.x, 
      true
    );
    let tempPos = new Pos(
      checkingPiece.y + checkDir.y, 
      checkingPiece.x + checkDir.x
    );
    let fieldsInBetween: Pos[] = [];

    while (
      tempPos.x !== this.checkedKingPos.x || 
      tempPos.y !== this.checkedKingPos.y
    ) {
      fieldsInBetween.push(new Pos(tempPos.y, tempPos.x));
      tempPos.x += checkDir.x;
      tempPos.y += checkDir.y;
    }
    return fieldsInBetween;
  }
}