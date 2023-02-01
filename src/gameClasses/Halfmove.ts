import { AnyPiece } from "./Pieces/Piece.js";
import Rook from "./Pieces/Rook.js";
import Pos from "./Pos.js";

export default class Halfmove {
  private promotedTo: (AnyPiece|null) = null;
  constructor(
    readonly piece: AnyPiece, 
    readonly from: Pos, 
    readonly to: Pos, 
    readonly capturedPiece: (AnyPiece|null),
    readonly posOfKingChecked: null|Pos,
    readonly rookThatCastled: null|Rook,
  ) {}

  public isCheck(): boolean {
    return (this.posOfKingChecked !== null);
  }

  public isCastle(): boolean {
    return (this.rookThatCastled !== null);
  }

  public getPromotedTo(): (AnyPiece|null) {
    return this.promotedTo;
  }

  public setPromotedTo(piece: AnyPiece): void {
    this.promotedTo = piece;
  }
}