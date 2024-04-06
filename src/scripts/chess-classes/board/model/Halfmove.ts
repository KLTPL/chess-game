import type { AnyPieceModel } from "../../pieces/model/PieceModel";
import PieceModel from "../../pieces/model/PieceModel";
import Pos from "./Pos";

export default class Halfmove {
  constructor(
    readonly piece: AnyPieceModel,
    readonly from: Pos,
    readonly to: Pos,
    readonly capturedPiece: AnyPieceModel | null,
    readonly posOfKingChecked: null | Pos,
    readonly isCastling: boolean,
    private promotedTo: AnyPieceModel | null
  ) {}

  public isCheck(): boolean {
    return this.posOfKingChecked !== null;
  }

  public isEnPassantCapture(): boolean {
    if (!PieceModel.isPawn(this.piece)) {
      return false;
    }
    return this.from.x != this.to.x && this.capturedPiece === null;
  }

  public getPromotedTo(): AnyPieceModel | null {
    return this.promotedTo;
  }

  public setPromotedTo(piece: AnyPieceModel): void {
    this.promotedTo = piece;
  }
}
