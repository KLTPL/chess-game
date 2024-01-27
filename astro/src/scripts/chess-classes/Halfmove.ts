import { type AnyPiece } from "./pieces/Piece";
import Pos from "./Pos";

export default class Halfmove {
  private promotedTo: AnyPiece | null = null;
  constructor(
    readonly piece: AnyPiece,
    readonly from: Pos,
    readonly to: Pos,
    readonly capturedPiece: AnyPiece | null,
    readonly posOfKingChecked: null | Pos,
    readonly isCastling: boolean
  ) {}

  public isCheck(): boolean {
    return this.posOfKingChecked !== null;
  }

  public getPromotedTo(): AnyPiece | null {
    return this.promotedTo;
  }

  public setPromotedTo(piece: AnyPiece): void {
    this.promotedTo = piece;
  }
}
