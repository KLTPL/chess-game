import Pos from "./Pos";
import Board from "./board-components/Board";
import Dir from "./Dir";
import Piece from "./pieces/Piece";

export default class Check {
  constructor(
    public checkingPiecePos: Pos,
    public checkedKingPos: Pos,
    private board: Board
  ) {}

  public createArrOfFieldsInBetweenPieceAndKing(): Pos[] {
    const piecePos = this.checkingPiecePos;
    const piece = this.board.getPiece(piecePos);
    if (Piece.isKnight(piece) || Piece.isPawn(piece)) {
      return [];
    }
    const checkDir = new Dir(
      this.checkedKingPos.y - piecePos.y,
      this.checkedKingPos.x - piecePos.x,
      true
    );
    const tempPos = new Pos(piecePos.y + checkDir.y, piecePos.x + checkDir.x);
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
