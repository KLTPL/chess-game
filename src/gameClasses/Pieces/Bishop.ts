import Board from "../Board.js";
import Piece, { PIECES } from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";

export default class Bishop extends Piece {
  constructor(team: number, board: Board) {
    super(team, board);
    this.num = PIECES.bishop;
    this.value = 3;

    this.addClassName(PIECES.bishop);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    const enemyTeamNum = this.enemyTeamNum();
    let possibleMoves: Pos[] = [];
    let tempPos: Pos;
    const directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    for (const dir of directions) {
      tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if ( 
          this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum && 
          this.board.el[tempPos.y][tempPos.x].piece?.num  !== PIECES.king
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (!this.board.posIsInBoard(tempPos)) {
          break;
        }
        possibleMoves.push(new Pos(tempPos.y, tempPos.x));
        if (this.board.el[tempPos.y][tempPos.x].piece?.team === this.team) {
          break;
        }
      }
    };
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const enemyTeamNum = this.enemyTeamNum();
    const myKing = this.board.getKingByTeamNum(this.team);
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMoves = [pos];
    let tempPos: Pos;
    const directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    for (const dir of directions) {
      tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if (this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if ( 
          !this.board.posIsInBoard(tempPos) ||
          this.board.el[tempPos.y][tempPos.x].piece?.team === this.team
        ) {
          break;
        }
        possibleMoves.push(new Pos(tempPos.y, tempPos.x));
      }
    };

    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsChecked(possibleMoves, myKing, pos);

    return possibleMoves;
  }
}