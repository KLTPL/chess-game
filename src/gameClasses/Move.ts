import Piece from "./Pieces/Piece";
import Pos from "./Pos";

export default class Move {
  piece: Piece;
  from: Pos;
  to: Pos;
  constructor(piece: Piece, from: Pos, to: Pos) {
    this.piece = piece;
    this.from = from;
    this.to = to;
  }
}