export default class Pos {
  x: number;
  y: number;
  constructor(y: number, x: number) {
    this.y = y;
    this.x = x;
  }

  invert(fieldsInOneRow: number) {
    return new Pos(fieldsInOneRow-1-this.y, fieldsInOneRow-1-this.x);
  }

  isEqualTo(pos: Pos) {
    return (
      this.x === pos.x && 
      this.y === pos.y
    );
  }
}