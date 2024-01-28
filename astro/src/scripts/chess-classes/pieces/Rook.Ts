import Board, { FIELDS_IN_ONE_ROW } from "../board-components/Board";
import Piece, { PIECES, TEAMS } from "./Piece";
import Pos from "../Pos";
import Dir from "../Dir";

export default class Rook extends Piece {
  public value: number = 5;
  public id: PIECES = PIECES.ROOK;
  constructor(
    readonly team: TEAMS,
    protected board: Board
  ) {
    super(team, board);
    this.addClassName(this.id);
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    const possibleMoves: Pos[] = [];
    const directions = [
      new Dir(1, 0),
      new Dir(-1, 0),
      new Dir(0, 1),
      new Dir(0, -1),
    ];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y, pos.x);
      while (true) {
        const piece = this.board.getPiece(tempPos);
        if (piece?.team === enemyTeamNum && !Piece.isKing(piece)) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (!Board.isPosIn(tempPos)) {
          break;
        }
        possibleMoves.push(new Pos(tempPos.y, tempPos.x));
        if (this.board.getPiece(tempPos)?.team === this.team) {
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
    possibleMoves = this.substractAbsPinsFromPossMoves(
      possibleMoves,
      absPins,
      pos
    );
    possibleMoves = this.removePossMovesIfKingIsInCheck(
      possibleMoves,
      myKing,
      pos
    );

    return possibleMoves;
  }

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    const directions = [
      new Dir(1, 0),
      new Dir(-1, 0),
      new Dir(0, 1),
      new Dir(0, -1),
    ];
    const moves: Pos[] = [];
    for (const dir of directions) {
      const tempPos = new Pos(pos.y, pos.x);
      while (true) {
        const piece = this.board.getPiece(tempPos);
        if (piece?.team === enemyTeamNum) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (
          !Board.isPosIn(tempPos) ||
          this.board.getPiece(tempPos)?.team === this.team
        ) {
          break;
        }
        moves.push(new Pos(tempPos.y, tempPos.x));
      }
    }
    return moves;
  }

  public sideEffectsOfMove(_: Pos, from: Pos): void {
    const castlingRights = this.board.getCastlingRightsByTeam(this.isWhite());

    const posXStartKingSide = FIELDS_IN_ONE_ROW - 1; // it's the same for white and black
    const posXStartQueenSide = 0; // it's the same for white and black

    if (castlingRights.k && from.x === posXStartKingSide) {
      castlingRights.k = false;
    }
    if (castlingRights.q && from.x === posXStartQueenSide) {
      castlingRights.q = false;
    }
  }
}
