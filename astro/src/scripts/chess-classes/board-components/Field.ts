import { FIELDS_IN_ONE_ROW } from "./Board";
import { type AnyPiece } from "../pieces/Piece";
import Pos from "../Pos";

export const CLASS_NAMES = {
  field: "field",
  fieldColor1: "field1",
  fieldColor2: "field2",
  fieldHighlightGeneral: "highlight",
  fieldInCheck: "field-king-check",
  fieldUnderMovingPiece: "field-heighlighted-under-moving-piece",
  fieldPieceWasSelectedFrom: "field-piece-selected-from",
  fieldRowAndColHighlight: "row-col-highlight",
  possMove: "poss-move",
  possMovePlain: "poss-move-plain",
  possMoveCapture: "poss-move-capture",
  fieldLastMove: "highlight-last-move",
  fieldMoveClassification: "move-classification",
  fieldBlunder: "move-classification-blunder",
  fieldBrilliant: "move-classification-brilliant",
  fieldLabel: "field-label",
  fieldLabelNumber: "field-label-number",
  fieldLabelLetter: "field-label-letter",
  fieldLabelField1: "field-label-field1",
  fieldLabelField2: "field-label-field2",
};

type FieldLabelInfo = {
  value: string;
  isNumber: boolean; // for css styling
};

export default class Field {
  public html: HTMLDivElement;
  public piece: AnyPiece | null;
  constructor(pos: Pos, isBoardInverted: boolean) {
    this.html = this.createFieldHtml(pos, isBoardInverted);
    this.addLabelToHtml(pos, isBoardInverted); // numbers 1 to 8 and letters A to H
    this.piece = null;
  }

  private createFieldHtml(pos: Pos, isBoardInverted: boolean): HTMLDivElement {
    const field = document.createElement("div");
    field.classList.add(CLASS_NAMES.field);
    field.classList.add(
      this.isFieldColor1(pos, isBoardInverted)
        ? CLASS_NAMES.fieldColor1
        : CLASS_NAMES.fieldColor2
    );
    return field;
  }

  private isFieldColor1(pos: Pos, isBoardInverted: boolean): boolean {
    // if board is not inverted field is field1 (white) only if row is even and col is even or row is odd and col is odd
    // so field on pos: (y=2, x=4) is field1, because 2 and 4 are both even numbers
    const isEven = (num: number) => num % 2 === 0;
    if (isBoardInverted) {
      return isEven(pos.y) !== isEven(pos.x);
    }
    return isEven(pos.y) === isEven(pos.x);
  }

  private addLabelToHtml(pos: Pos, isBoardInverted: boolean) {
    // numbers 1 to 8 and letters A to H
    this.getLabelsForField(pos, isBoardInverted)?.forEach((labelInfo) => {
      const div = document.createElement("div");
      div.innerText = labelInfo.value;
      div.classList.add(
        CLASS_NAMES.fieldLabel,
        labelInfo.isNumber
          ? CLASS_NAMES.fieldLabelNumber
          : CLASS_NAMES.fieldLabelLetter
      );
      this.html.append(div);
    });
  }

  private getLabelsForField(
    pos: Pos,
    isBoardInverted: boolean
  ): FieldLabelInfo[] | null {
    const posStr = `${pos.y},${pos.x}`;
    const substract = isBoardInverted ? FIELDS_IN_ONE_ROW - 1 : 0;
    const numbers = ["8", "7", "6", "5", "4", "3", "2", "1"]; // .length === FIELDS_IN_ONE_ROW
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"]; // .length === FIELDS_IN_ONE_ROW
    const getNum = (index: number) => numbers[Math.abs(substract - index)];
    const getLett = (index: number) => letters[Math.abs(substract - index)];
    switch (posStr) {
      case "0,0":
        return [{ value: getNum(0), isNumber: true }];
      case "1,0":
        return [{ value: getNum(1), isNumber: true }];
      case "2,0":
        return [{ value: getNum(2), isNumber: true }];
      case "3,0":
        return [{ value: getNum(3), isNumber: true }];
      case "4,0":
        return [{ value: getNum(4), isNumber: true }];
      case "5,0":
        return [{ value: getNum(5), isNumber: true }];
      case "6,0":
        return [{ value: getNum(6), isNumber: true }];
      case "7,0":
        return [
          { value: getNum(7), isNumber: true },
          { value: getLett(0), isNumber: false },
        ];
      case "7,1":
        return [{ value: getLett(1), isNumber: false }];
      case "7,2":
        return [{ value: getLett(2), isNumber: false }];
      case "7,3":
        return [{ value: getLett(3), isNumber: false }];
      case "7,4":
        return [{ value: getLett(4), isNumber: false }];
      case "7,5":
        return [{ value: getLett(5), isNumber: false }];
      case "7,6":
        return [{ value: getLett(6), isNumber: false }];
      case "7,7":
        return [{ value: getLett(7), isNumber: false }];
      default:
        return null;
    }
  }

  public invertHtml(pos: Pos, isBoardInverted: boolean) {
    this.html
      .querySelectorAll(`.${CLASS_NAMES.fieldLabel}`)
      .forEach((label) => label.remove());
    this.addLabelToHtml(pos, isBoardInverted);
  }

  public isOccupied(): boolean {
    return this.piece !== null;
  }
}
