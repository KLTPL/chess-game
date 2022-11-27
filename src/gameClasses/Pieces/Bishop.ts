import Board from "../Board.js";
import Piece from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";

export default class Bishop extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 4;
    this.value = 3;
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let tempPos: Pos;
    let directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    for (let dir of directions) {
      tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if ( 
          this.board.el[tempPos.y][tempPos.x].piece.team === this.enemyTeamNum() && 
          this.board.el[tempPos.y][tempPos.x].piece.num  !== this.board.kingNum
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (
          tempPos.x < 0 || tempPos.x > 7 || 
          tempPos.y < 0 || tempPos.y > 7
        ) {
          break;
        }
        possibleMoves.push(new Pos(tempPos.y, tempPos.x));
        if (this.board.el[tempPos.y][tempPos.x].piece.team === this.team) {
          break;
        }
      }
    };
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = 
      (this.team === this.board.whiteNum) ? 
      this.board.kings.white : 
      this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    for (let dir of directions) {
      tempPos = new Pos(pos.y,pos.x);
      while (true) {
        if (this.board.el[tempPos.y][tempPos.x].piece.team === this.enemyTeamNum()) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( 
          (tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7) ||
          this.board.el[tempPos.y][tempPos.x].piece.team === this.team
        ) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
      }
    };

    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsChecked(possibleMoves, myKing, pos);

    return possibleMoves;
  }
}