import Piece from "./Pieces/Piece.js";
import Pos from "./Pos.js";

export default class Move {
  piece: Piece;
  from: Pos;
  to: Pos;
  capture: boolean;
  constructor(piece: Piece, from: Pos, to: Pos, capture: boolean) {
    this.piece = piece;
    this.from = from;
    this.to = to;
    this.capture = capture;
  }
}