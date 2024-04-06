import BoardModel, {
  FIELDS_IN_ONE_ROW,
} from "../../board-components/model/BoardModel";
import PieceModel, {
  PIECES,
  TEAMS,
  type Pin,
  type AnyPieceModel,
} from "./PieceModel";
import Pos, { POS_OUT_OF_BOARD } from "../../board-components/model/Pos";
import Dir from "../../board-components/model/Dir";
import Check from "../../board-components/model/Check";

export type CastleRights = {
  isAllowedKingSide: boolean;
  isAllowedQueenSide: boolean;
};

export default class KingModel extends PieceModel {
  readonly value: number = 0;
  readonly id: PIECES = PIECES.KING;
  public pos = new Pos(POS_OUT_OF_BOARD, POS_OUT_OF_BOARD);
  constructor(
    readonly team: TEAMS,
    protected boardModel: BoardModel
  ) {
    super(team, boardModel);
  }

  public updatePosProperty(): void {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        if (this.boardModel.getPiece(pos) === this) {
          this.pos = pos;
        }
      }
    }
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const directions = [
      new Dir(1, 1),
      new Dir(-1, -1),
      new Dir(-1, 1),
      new Dir(1, -1),
      new Dir(1, 0),
      new Dir(-1, 0),
      new Dir(0, 1),
      new Dir(0, -1),
    ];

    return directions
      .map((dir) => new Pos(pos.y + dir.y, pos.x + dir.x))
      .filter((pos) => BoardModel.isPosInBounds(pos));
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const possibleMoves = [
      pos,
      ...this.createArrOfNormalMoves(pos),
      ...this.createArrOfPossibleCastlePos(pos),
    ];
    return this.filterMovesSoKingCantMoveIntoCheck(possibleMoves);
  }

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    const directions = [
      new Dir(1, 1),
      new Dir(-1, -1),
      new Dir(-1, 1),
      new Dir(1, -1),
      new Dir(1, 0),
      new Dir(-1, 0),
      new Dir(0, 1),
      new Dir(0, -1),
    ];
    return directions
      .map((dir) => new Pos(pos.y + dir.y, pos.x + dir.x))
      .filter((pos) => {
        return (
          BoardModel.isPosInBounds(pos) &&
          this.boardModel.getPiece(pos)?.team !== this.team
        );
      });
  }

  private createArrOfPossibleCastlePos(pos: Pos): Pos[] {
    const castlesDir = this.createArrOfPossibleCastleDir(pos);
    const castleNormalMoves = castlesDir.map(
      (dir) => new Pos(pos.y + dir.y * 2, pos.x + dir.x * 2)
    );
    // const castleMovesOnRook = castlesDir.map(dir => {
    //   const currentRookXPos = (dir.x > 0) ? FIELDS_IN_ONE_ROW-1 : 0;
    //   return new Pos(pos.y, currentRookXPos);
    // });
    return castleNormalMoves;
  }

  private createArrOfPossibleCastleDir(pos: Pos): Dir[] {
    const castlingRights = this.boardModel.getCastlingRightsByTeam(
      this.isWhite()
    );
    if (!castlingRights.k && !castlingRights.q) {
      return [];
    }

    return [new Dir(0, 1), new Dir(0, -1)].filter((dir) => {
      const currentRookXPos = dir.x > 0 ? FIELDS_IN_ONE_ROW - 1 : 0;
      const move1 = new Pos(pos.y, pos.x + dir.x);
      const move2 = new Pos(pos.y, pos.x + dir.x * 2);
      const moves = [move1, move2];
      const fieldsXPos = this.createArrOfFieldsXPosBetweenKingAndRook(
        currentRookXPos,
        pos.x,
        dir.x as -1 | 1
      ); // sometimes 2 fields, sometimes 3
      return (
        this.isKingRightToCastle(move2.x, pos.x) &&
        fieldsXPos.filter(
          (xPos) => this.boardModel.getPiece(new Pos(pos.y, xPos)) === null
        ).length === fieldsXPos.length &&
        this.filterMovesSoKingCantMoveIntoCheck(moves).length === moves.length
      );
    });
  }

  private isKingRightToCastle(
    castleMoveX: number,
    startKingXPos: number
  ): boolean {
    const b = this.boardModel;
    const castlingRights = b.getCastlingRightsByTeam(this.isWhite());
    const startQueenXPos = this.isWhite()
      ? b.startQueenPosWhite.x
      : b.startQueenPosBlack.x;
    const isCastleKingSide =
      Math.abs(castleMoveX - startQueenXPos) >
      Math.abs(castleMoveX - startKingXPos);
    return isCastleKingSide ? castlingRights.k : castlingRights.q;
  }

  private createArrOfFieldsXPosBetweenKingAndRook(
    rookXPos: number,
    kingXPos: number,
    dirX: -1 | 1
  ): number[] {
    const fields: number[] = [];
    const amountOfFields = Math.abs(rookXPos - kingXPos) - 1;
    let tempPos = kingXPos + dirX;
    while (fields.length < amountOfFields) {
      fields.push(tempPos);
      tempPos += dirX;
    }
    return fields;
  }

  private filterMovesSoKingCantMoveIntoCheck(moves: Pos[]): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    const b = this.boardModel;
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const piece = b.getPiece(pos);
        if (piece === null || (piece as AnyPieceModel).team !== enemyTeamNum) {
          continue;
        }

        const enemyPiecePossMoves = (
          piece as AnyPieceModel
        ).createArrOfPossibleMovesFromPosForKing(pos);
        for (const enemyPossMove of enemyPiecePossMoves) {
          moves = moves.filter((move) => {
            return (
              (enemyPossMove.x !== move.x || enemyPossMove.y !== move.y) &&
              (enemyPossMove.x !== c || enemyPossMove.y !== r)
            );
          });
        }
      }
    }
    return moves;
  }

  public createArrOfAbsolutePins(): Pin[] {
    const kingPos = this.boardModel.getKingPosByTeam(this.team);
    const enemyTeamNum = this.enemyTeamNum;
    const absPins: Pin[] = [];

    const directions = [
      new Dir(1, 0),
      new Dir(-1, 0),
      new Dir(0, 1),
      new Dir(0, -1),
      new Dir(1, 1),
      new Dir(-1, 1),
      new Dir(1, -1),
      new Dir(-1, -1),
    ];

    for (const direction of directions) {
      const isKingInlineVerticallyOrHorizontally =
        direction.x === 0 || direction.y === 0;

      let pinInThisDir: Pin | null = null;
      const tempPos = new Pos(kingPos.y + direction.y, kingPos.x + direction.x);

      while (BoardModel.isPosInBounds(tempPos)) {
        const piece = this.boardModel.getPiece(tempPos);
        if (piece === null) {
          tempPos.x += direction.x;
          tempPos.y += direction.y;
          continue;
        }
        if (pinInThisDir === null) {
          if (piece.team === enemyTeamNum) {
            break;
          }
          pinInThisDir = {
            pinnedPiecePos: new Pos(tempPos.y, tempPos.x),
            pinDir: direction,
          };
          tempPos.x += direction.x;
          tempPos.y += direction.y;
          continue;
        }

        if (
          (!PieceModel.isBishop(piece) &&
            !PieceModel.isRook(piece) &&
            !PieceModel.isQueen(piece)) ||
          piece.team === this.team
        ) {
          break;
        }

        if (
          (isKingInlineVerticallyOrHorizontally &&
            !PieceModel.isBishop(piece)) ||
          (!isKingInlineVerticallyOrHorizontally && !PieceModel.isRook(piece))
        ) {
          absPins.push(pinInThisDir);
        }

        tempPos.x += direction.x;
        tempPos.y += direction.y;
      }
    }
    return absPins;
  }

  public sideEffectsOfMove(to: Pos, from: Pos): void {
    const b = this.boardModel;
    const castlingRights = b.getCastlingRightsByTeam(this.isWhite());

    if (castlingRights.k) {
      castlingRights.k = false;
    }
    if (castlingRights.q) {
      castlingRights.q = false;
    }

    this.pos = to;
    // castle
    if (KingModel.isMoveCastling(from, to)) {
      const { newRookPos, oldRookPos } =
        KingModel.calcRookPossitionsForCastlingMove(from, to);
      const movingRook = b.getPiece(oldRookPos) as AnyPieceModel;
      b.removePieceInPos(oldRookPos);
      b.placePieceInPos(newRookPos, movingRook);
    }
  }

  public isInCheck() {
    return this.createArrOfChecks().length > 0;
  }

  public createArrOfChecks(): Check[] {
    return this.createArrOfPositionsOfPiecesCheckingKing().map(
      (pos) => new Check(pos, this.pos, this.boardModel)
    );
  }

  private createArrOfPositionsOfPiecesCheckingKing(): Pos[] {
    const enemyTeam = this.enemyTeamNum;
    const checkingPieces: Pos[] = [];

    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const piece = this.boardModel.getPiece(pos);
        if (piece === null || piece.team !== enemyTeam) {
          continue;
        }
        for (const move of piece.createArrOfPossibleMovesFromPosForKing(pos)) {
          if (this.pos.isEqualTo(move)) {
            checkingPieces.push(pos);
          }
        }
      }
    }
    return checkingPieces;
  }

  public static isMoveCastling(from: Pos, to: Pos): boolean {
    return Math.abs(from.x - to.x) > 1;
  }
  public static calcRookPossitionsForCastlingMove(from: Pos, to: Pos) {
    const castleDir = new Dir(0, to.x - from.x, true);
    const isCastleToRight = castleDir.x === 1;
    const rookXPos = isCastleToRight ? FIELDS_IN_ONE_ROW - 1 : 0;
    const oldRookPos = new Pos(from.y, rookXPos);
    const newRookPos = new Pos(to.y, to.x + castleDir.x * -1);
    return { oldRookPos, newRookPos };
  }
}
