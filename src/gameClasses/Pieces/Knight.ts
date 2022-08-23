import Board from "../Board";
import Piece from "./Piece";
import Pos from "../Pos";
import Dir from "../Dir";

export default class Knight extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 3;
    this.value = 3;

  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let directions = [
      new Dir(1,2), new Dir(1,-2), new Dir(-1,2), new Dir(-1,-2), 
      new Dir(2,1), new Dir(2,-1), new Dir(-2,1), new Dir(-2,-1)
    ];
    for( let dir of directions ) {
      if( pos.x+dir.x>=0 && pos.x+dir.x<=7 && pos.y+dir.y>=0 && pos.y+dir.y<=7 ) {
        possibleMoves.push(new Pos(pos.y+dir.y, pos.x+dir.x));
      }
    };
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===this.board.whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMovesFromPosForKnight = this.getPossibleMovesFromPosForKing(pos);
    for( let i=0 ; i<possibleMovesFromPosForKnight.length ; i++ ) {
      if( this.board.el[possibleMovesFromPosForKnight[i].y][possibleMovesFromPosForKnight[i].x].piece.team===this.team ) {
        possibleMovesFromPosForKnight.splice(i, 1);
        i--;
      }
    }
    let possibleMoves = [pos, ...possibleMovesFromPosForKnight];

    possibleMoves = this.substraktAbsPinsFromPossMoves(possibleMoves, absPins, pos);

    return possibleMoves;
  }
}