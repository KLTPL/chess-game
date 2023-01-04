import Pos from "./Pos.js";
import Board from "./Board.js";
import Dir from "./Dir.js";
import { PIECES } from "./Pieces/Piece.js";

export default class Check {
  constructor(
    public checkingPiecePos: Pos, 
    public checkedKingPos: Pos, 
    private board: Board
  ) {}

  public getFieldsInBetweenPieceAndKing(): Pos[] {
    const piece = this.checkingPiecePos;
    if( 
      this.board.el[piece.y][piece.x].piece?.id === PIECES.KNIGHT ||
      this.board.el[piece.y][piece.x].piece?.id === PIECES.PAWN
    ) {
      return [];
    }
    const checkDir = new Dir(
      this.checkedKingPos.y - piece.y, 
      this.checkedKingPos.x - piece.x, 
      true
    );
    const tempPos = new Pos(
      piece.y + checkDir.y, 
      piece.x + checkDir.x
    );
    const fieldsInBetween: Pos[] = [];

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