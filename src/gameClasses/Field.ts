import { AnyPiece } from "./Pieces/Piece.js";

export const CLASS_NAMES = {
  field: "field",
  fieldColor1: "field1",
  fieldColor2: "field2",
  fieldHighlightGeneral: "highlight",
  fieldInCheck: "field-king-check",
  fieldUnderMovingPiece: "field-heighlighted-under-moving-piece",
  fieldPieceWasSelectedFrom: "field-piece-selected-from",
  possMove: "poss-move",
  possMovePlain: "poss-move-plain",
  possMoveCapture: "poss-move-capture",
  brilliantMove: "brilliant-move",
};

export default class Field {
  public html: HTMLDivElement;
  public piece: (AnyPiece|null);
  constructor(isFieldWhite: boolean) {
    this.html = this.createFieldHtml(isFieldWhite);
    this.piece = null;
  }

  private createFieldHtml(isFieldWhite: boolean): HTMLDivElement {
    const field = document.createElement("div");
    field.classList.add(CLASS_NAMES.field);
    field.classList.add(
      (isFieldWhite) ?
      CLASS_NAMES.fieldColor1 : 
      CLASS_NAMES.fieldColor2
    );
    return field;
  }

  public setPiece(piece: (AnyPiece|null)) {
    this.piece = piece;
  }

  public isFieldOccupied(): boolean {
    return this.piece !== null;
  }
}