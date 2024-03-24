import Pos from "../../board-components/model/Pos";
import Dir from "../../board-components/model/Dir";
import Check from "../../board-components/model/Check";
import type BoardModel from "../../board-components/model/BoardModel";
import type PawnModel from "./PawnModel";
import type RookModel from "./RookModel";
import type KnightModel from "./KnightModel";
import type BishopModel from "./BishopModel";
import type QueenModel from "./QueenModel";
import type KingModel from "./KingModel";

export type AnyPieceModel =
  | PawnModel
  | RookModel
  | KnightModel
  | BishopModel
  | QueenModel
  | KingModel;

export const enum PIECES {
  PAWN,
  ROOK,
  KNIGHT,
  BISHOP,
  QUEEN,
  KING,
}

export const enum TEAMS {
  WHITE,
  BLACK,
}

export type Pin = {
  pinnedPiecePos: Pos;
  pinDir: Dir;
};

export default abstract class PieceModel {
  abstract readonly value: number;
  abstract readonly id: PIECES;
  constructor(
    readonly team: TEAMS,
    protected boardModel: BoardModel
  ) {}

  public abstract createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[];

  public abstract createArrOfPossibleMovesFromPos(pos: Pos): Pos[];

  public sideEffectsOfMove(to: Pos, from: Pos): void {
    to;
    from;
  }

  protected substractAbsPinsFromPossMoves(
    possMoves: Pos[],
    absPins: Pin[],
    pos: Pos
  ): Pos[] {
    for (const pin of absPins) {
      if (pin.pinnedPiecePos.isEqualTo(pos)) {
        possMoves = possMoves.filter((move) => {
          const simplifyXAndY = PieceModel.isKnight(
            this.boardModel.getPiece(pos)
          )
            ? false
            : true; // simplify means make 1 if >1 and -1 if <-1
          const moveDir = new Dir(
            move.y - pos.y,
            move.x - pos.x,
            simplifyXAndY
          );
          return (
            moveDir.isEqualTo(new Dir(0, 0)) ||
            moveDir.isEqualTo(pin.pinDir) ||
            moveDir.isEqualTo(new Dir(-pin.pinDir.y, -pin.pinDir.x))
          );
        });
      }
    }
    return possMoves;
  }

  protected removePossMovesIfKingIsInCheck(
    possMoves: Pos[],
    myKing: KingModel,
    pos: Pos
  ): Pos[] {
    const checks = myKing.createArrOfChecks();
    if (checks.length === 0) {
      return possMoves;
    }
    if (checks.length === 2) {
      return [];
    }
    return possMoves.filter((possMove) => {
      return (
        !possMove.isEqualTo(pos) &&
        this.isMoveCaptureOrOnTheWayOfCheck(checks[0], possMove) //myKing.checks[0] is the only check
      );
    });
  }

  private isMoveCaptureOrOnTheWayOfCheck(check: Check, move: Pos): boolean {
    const isCapture =
      check.checkingPiecePos.x === move.x &&
      check.checkingPiecePos.y === move.y;
    let isOnTheLine = false;
    for (const field of check.createArrOfFieldsInBetweenPieceAndKing()) {
      if (move.isEqualTo(field)) {
        isOnTheLine = true;
      }
    }
    return isCapture || isOnTheLine;
  }

  public isWhite(): boolean {
    return this.team === TEAMS.WHITE;
  }

  public get enemyTeamNum(): TEAMS.BLACK | TEAMS.WHITE {
    return PieceModel.getEnemyTeam(this.team);
  }

  public static isArrContainingEqualPieces(
    ...pieces: (PieceModel | null)[]
  ): boolean {
    if (pieces.length === 0) {
      console.error("Not enough captures to compare");
      return false;
    }
    const firstCapture = pieces[0];
    for (let i = 1; i < pieces.length; i++) {
      if (firstCapture !== pieces[i]) {
        return false;
      }
    }
    return true;
  }

  public static getEnemyTeam(team: TEAMS): TEAMS {
    return team === TEAMS.WHITE ? TEAMS.BLACK : TEAMS.WHITE;
  }
  public static isKing(piece: AnyPieceModel | null): piece is KingModel {
    return piece?.id === PIECES.KING;
  }

  public static isPawn(piece: AnyPieceModel | null): piece is PawnModel {
    return piece?.id === PIECES.PAWN;
  }

  public static isBishop(piece: AnyPieceModel | null): piece is BishopModel {
    return piece?.id === PIECES.BISHOP;
  }

  public static isKnight(piece: AnyPieceModel | null): piece is KnightModel {
    return piece?.id === PIECES.KNIGHT;
  }

  public static isQueen(piece: AnyPieceModel | null): piece is QueenModel {
    return piece?.id === PIECES.QUEEN;
  }

  public static isRook(piece: AnyPieceModel | null): piece is RookModel {
    return piece?.id === PIECES.ROOK;
  }
}
