import Board from "../Board.js";
import Piece, { PIECES } from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";

export default class Rook extends Piece {
  haventMovedYet: boolean;
  constructor(team: number, board: Board) {
    super(team, board);
    this.num = PIECES.rook;
    this.value = 5;
    this.haventMovedYet = true;

    this.addClassName(this.num);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    const enemyTeamNum = this.enemyTeamNum();
    const possibleMoves: Pos[] = [];
    const directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum && 
          this.board.el[tempPos.y][tempPos.x].piece?.num !== PIECES.king
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (!this.board.isPosInBoard(tempPos)) {
          break;
        }
        possibleMoves.push(new Pos(tempPos.y, tempPos.x));
        if (this.board.el[tempPos.y][tempPos.x].piece?.team === this.team) {
          break;
        }
      }
    }
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.getPossitionsOfAbsolutePins();

    let possibleMoves = [pos, ...this.createArrOfNormalMoves(pos)];
    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsInCheck(possibleMoves, myKing, pos);

    return possibleMoves;
  }

  createArrOfNormalMoves(pos: Pos) {
    const enemyTeamNum = this.enemyTeamNum();
    const directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    const moves: Pos[] = [];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y,pos.x);
      while (true) {
        if (this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( 
          !this.board.isPosInBoard(tempPos) ||
          this.board.el[tempPos.y][tempPos.x].piece?.team === this.team
        ) {
          break;
        }
        moves.push(new Pos(tempPos.y, tempPos.x));
      }
    }
    return moves;
  }

  sideEffectsOfMove() {
    if (this.haventMovedYet) {
      this.haventMovedYet = false;
    }
  }
}
