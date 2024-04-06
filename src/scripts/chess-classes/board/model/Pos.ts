import { FIELDS_IN_ONE_ROW } from "./BoardModel";

export const POS_OUT_OF_BOARD = -1;

export default class Pos {
  constructor(
    public y: number,
    public x: number
  ) {}

  public getInvProp(isBoardInverted: boolean): Pos {
    // is inverted properly
    return isBoardInverted
      ? new Pos(Pos.invertPosXOrY(this.y), Pos.invertPosXOrY(this.x))
      : new Pos(this.y, this.x);
  }

  public isEqualTo(pos: Pos): boolean {
    return this.x === pos.x && this.y === pos.y;
  }

  public static invertPosXOrY(posXOrY: number): number {
    return FIELDS_IN_ONE_ROW - 1 - posXOrY;
  }
}
