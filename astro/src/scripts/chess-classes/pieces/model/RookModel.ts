import Dir from "../../board-components/model/Dir";
import Pos from "../../board-components/model/Pos";
import BoardModel, {
  FIELDS_IN_ONE_ROW,
} from "../../board-components/model/BoardModel";
import PieceModel, { PIECES, TEAMS } from "./PieceModel";

export default class RookModel extends PieceModel {
  readonly value: number = 5;
  readonly id: PIECES = PIECES.ROOK;
  constructor(
    readonly team: TEAMS,
    protected boardModel: BoardModel
  ) {
    super(team, boardModel);
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
        const piece = this.boardModel.getPiece(tempPos);
        if (piece?.team === enemyTeamNum && !PieceModel.isKing(piece)) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (!BoardModel.isPosInBounds(tempPos)) {
          break;
        }
        possibleMoves.push(new Pos(tempPos.y, tempPos.x));
        if (this.boardModel.getPiece(tempPos)?.team === this.team) {
          break;
        }
      }
    }
    return possibleMoves;
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.boardModel.getKingByTeam(this.team);
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
        const piece = this.boardModel.getPiece(tempPos);
        if (piece?.team === enemyTeamNum) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if (
          !BoardModel.isPosInBounds(tempPos) ||
          this.boardModel.getPiece(tempPos)?.team === this.team
        ) {
          break;
        }
        moves.push(new Pos(tempPos.y, tempPos.x));
      }
    }
    return moves;
  }

  public sideEffectsOfMove(_: Pos, from: Pos): void {
    const castlingRights = this.boardModel.getCastlingRightsByTeam(
      this.isWhite()
    );

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
