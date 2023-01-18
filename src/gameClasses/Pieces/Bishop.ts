import Board from "../Board.js";
import Piece, { PIECES, TEAMS } from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";

export default class Bishop extends Piece {
  public value: number = 3;
  public id: PIECES = PIECES.BISHOP;
  constructor(readonly team: TEAMS, protected board: Board) {
    super(team, board);
    this.addClassName(this.id);
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    let possibleMoves: Pos[] = [];
    const directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y, pos.x);
      while (true) {
        const piece = this.board.el[tempPos.y][tempPos.x].piece;
        if ( 
          this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum && 
          !Piece.isKing(piece)
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
    };
    return possibleMoves;
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.createArrOfAbsolutePins();

    let possibleMoves = [pos, ...this.createArrOfNormalMoves(pos)];
    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsInCheck(possibleMoves, myKing, pos);

    return possibleMoves;
  }

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    const moves: Pos[] = [];
    const directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];

    for (const dir of directions) {
      let tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if (this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if ( 
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
}