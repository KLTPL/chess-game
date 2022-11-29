import Piece from "./Pieces/Piece.js";
import Pos from "./Pos.js";

export default class Move {
  piece: Piece;
  from: Pos;
  to: Pos;
  capturedPiece: Piece | null;
  constructor(piece: Piece, from: Pos, to: Pos, capture: Piece | null) {
    this.piece = piece;
    this.from = from;
    this.to = to;
    this.capturedPiece = capture;
  }
}