// import Board from "./Board";
import Halfmove from "./Halfmove";

// const GO_TO_MOVE_TIME_MS = 100;

export default class MovesSystem {
  readonly halfmoves: Halfmove[] = [];
  // private currMoveNum = 0;
  constructor(/*private board: Board*/) {
    
  }

  public pushNewHalfmove(halfmove: Halfmove) {
    this.halfmoves.push(halfmove);
    // this.currMoveNum = this.halfmoves.length;
  }

  
  public getLatestHalfmove(): Halfmove {
    return this.halfmoves[this.halfmoves.length-1];
  }

  // private goBackOneHalfmove() {
  //   this.currMoveNum--;
  // }
}