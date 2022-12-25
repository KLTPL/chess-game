import Piece, { AnyPiece } from "./Pieces/Piece.js";
import Pos from "./Pos.js";

export default class Move {
  public promotedTo: (Piece|null) = null;
  constructor(
    public piece: AnyPiece, 
    public from: Pos, 
    public to: Pos, 
    public capturedPiece: (Piece|null)
  ) {}

  public setPromotedTo(piece: AnyPiece): void {
    this.promotedTo = piece;
  }
}