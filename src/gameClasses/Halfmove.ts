import { AnyPiece } from "./Pieces/Piece.js";
import Pos from "./Pos.js";

export default class Halfmove {
  private promotedTo: (AnyPiece|null) = null;
  constructor(
    readonly piece: AnyPiece, 
    readonly from: Pos, 
    readonly to: Pos, 
    readonly capturedPiece: (AnyPiece|null)
  ) {}

  public getPromotedTo(): (AnyPiece|null) {
    return this.promotedTo;
  }

  public setPromotedTo(piece: AnyPiece): void {
    this.promotedTo = piece;
  }
}