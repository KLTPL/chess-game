import Piece from "./Pieces/Piece.js";
import Pos from "./Pos.js";

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