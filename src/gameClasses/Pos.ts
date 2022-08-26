import Board from "./Board";

export default class Pos {
  x: number;
  y: number;
  constructor( y: number, x: number ) {
    this.y = y;
    this.x = x;
  }

  invert( fieldsInOneRow: number) {
    return new Pos(fieldsInOneRow-1-this.y, fieldsInOneRow-1-this.x);
  }
}