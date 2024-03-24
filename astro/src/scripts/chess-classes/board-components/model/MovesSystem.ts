// import Board from "./Board";
import Halfmove from "./Halfmove";

// const GO_TO_MOVE_TIME_MS = 100;

export default class MovesSystem {
  readonly halfmoves: Halfmove[] = [];
  // private currMoveNum = 0;
  constructor(/*private board: Board*/) {}

  public pushNewHalfmove(halfmove: Halfmove): void {
    this.halfmoves.push(halfmove);
    // this.currMoveNum = this.halfmoves.length;
  }

  public isThereAtLeastOneHalfMove(): boolean {
    return this.halfmoves.length > 0;
  }

  public getLatestHalfmove(): Halfmove {
    return this.halfmoves[this.halfmoves.length - 1];
  }

  public getHalfmovesAmount() {
    return this.halfmoves.length;
  }

  public getHalfmoveAt(idx: number) {
    return this.halfmoves[idx];
  }
  // private goBackOneHalfmove() {
  //   this.currMoveNum--;
  // }
}
