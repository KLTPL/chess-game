import { FIELDS_IN_ONE_ROW } from "./Board";

export const POS_OUT_OF_BOARD = -1;

export default class Pos {
  constructor(public y: number, public x: number, isInverted?: boolean) {
    if (isInverted) {
      this.invert();
    }
  }

  public getInvertedProperly(isBoardInverted: boolean): Pos {
    return (
      (isBoardInverted) ?
      new Pos(Pos.invertPosXOrY(this.y), Pos.invertPosXOrY(this.x)) :
      new Pos(this.y, this.x)
    );
  }

  public invert(): void {
    this.y = Pos.invertPosXOrY(this.y);
    this.x = Pos.invertPosXOrY(this.x);
  }

  public isEqualTo(pos: Pos): boolean {
    return (
      this.x === pos.x && 
      this.y === pos.y
    );
  }

  public static invertPosXOrY(posXOrY: number): number {
    return FIELDS_IN_ONE_ROW-1-posXOrY;
  }
}