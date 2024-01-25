import Board from "../board-components/Board";
import Piece, { PIECES, TEAMS } from "./Piece";
import Pos from "../Pos";
import Dir from "../Dir";

export default class Rook extends Piece {
  public value: number = 5;
  public id: PIECES = PIECES.ROOK;
  public isBeforeAnyMove: boolean = true;
  constructor(readonly team: TEAMS, protected board: Board) {
    super(team, board);
    this.addClassName(this.id);
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    const possibleMoves: Pos[] = [];
    const directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum && 
          !Piece.isKing(this.board.el[tempPos.y][tempPos.x].piece)
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (!Board.isPosIn(tempPos)) {
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
    const directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    const moves: Pos[] = [];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y, pos.x);
      while (true) {
        if (this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( 
          !Board.isPosIn(tempPos) ||
          this.board.el[tempPos.y][tempPos.x].piece?.team === this.team
        ) {
          break;
        }
        moves.push(new Pos(tempPos.y, tempPos.x));
      }
    }
    return moves;
  }

  public sideEffectsOfMove(): void {
    if (this.isBeforeAnyMove) {
      this.isBeforeAnyMove = false;
    }
  }
}
