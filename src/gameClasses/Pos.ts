import { FIELDS_IN_ONE_ROW } from "./Board";

export default class Pos {
  x: number;
  y: number;
  constructor(y: number, x: number, isInverted?: boolean) {
    this.y = y;
    this.x = x;
    if (isInverted) {
      this.invert();
    }
  }

  invert() {
    this.y = FIELDS_IN_ONE_ROW-1-this.y;
    this.x = FIELDS_IN_ONE_ROW-1-this.x;
  }

  isEqualTo(pos: Pos) {
    return (
      this.x === pos.x && 
      this.y === pos.y
    );
  }
}