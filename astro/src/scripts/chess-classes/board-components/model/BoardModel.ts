import Pos from "./Pos";
import Halfmove from "./Halfmove";
import MatchController from "../controller/MatchController";
import FENNotation from "./FENNotation";
import MovesSystem from "./MovesSystem";
import {
  END_REASONS_ID_DB,
  GAME_RESULTS_ID_DB,
  type GetDBGameData,
} from "../../../../db/types";
import IncludeDBData from "./IncludeDBData";
import FetchToDB from "./FetchToDB";
import PieceModel, {
  TEAMS,
  type AnyPieceModel,
  PIECES,
} from "../../pieces/model/PieceModel";
import KingModel from "../../pieces/model/KingModel";
import BishopModel from "../../pieces/model/BishopModel";
import PawnModel from "../../pieces/model/PawnModel";
import RookModel from "../../pieces/model/RookModel";
import KnightModel from "../../pieces/model/KnightModel";
import QueenModel from "../../pieces/model/QueenModel";

export type ArrOfPieces2d = (AnyPieceModel | null)[][];

type KingsObj = {
  white: KingModel;
  black: KingModel;
};

type KingCastlingRights = {
  k: boolean;
  q: boolean;
};

export type CastlingRights = {
  white: KingCastlingRights;
  black: KingCastlingRights;
};

export const FIELDS_IN_ONE_ROW = 8;

export default class BoardModel {
  private currTeam: TEAMS;
  private pieces: ArrOfPieces2d = [];
  readonly movesSystem: MovesSystem = new MovesSystem(/*this*/);
  private kings: KingsObj;
  private castlingRights: CastlingRights;
  readonly includeDBData: IncludeDBData = null as never;
  readonly fetchToDB: FetchToDB | null;
  constructor(
    customPositionFEN: string | null,
    DBGameData: GetDBGameData | null,
    public match: MatchController | null
  ) {
    const startFENNotation = new FENNotation(customPositionFEN, this);
    this.currTeam = startFENNotation.activeColorConverted;
    this.castlingRights = startFENNotation.castlingRightsConverted;
    this.fetchToDB =
      DBGameData === null ? null : new FetchToDB(DBGameData.game.id);

    this.pieces = startFENNotation.piecePlacementConverted;
    const kings = this.createKingsObj(this.pieces);
    const isThereExaclyTwoKingsOfOppositeTeam = kings !== null;

    if (isThereExaclyTwoKingsOfOppositeTeam) {
      this.kings = {
        white: kings.white,
        black: kings.black,
      };
      this.kings.white.updatePosProperty();
      this.kings.black.updatePosProperty();
    } else {
      setTimeout(() =>
        this.match?.end({
          id: this.fetchToDB?.game_id,
          end_reason_id: END_REASONS_ID_DB.DATA_ERROR,
          result_id: GAME_RESULTS_ID_DB.DRAW,
        })
      );
      //setTimeout so constructor is finished before calling Match.end
      this.kings = null as never;
      //this.kings doesn't matter because the game is already over
    }

    if (this.isDrawByInsufficientMaterial()) {
      setTimeout(() =>
        this.match?.end({
          id: this.fetchToDB?.game_id,
          end_reason_id: END_REASONS_ID_DB.INSUFFICENT,
          result_id: GAME_RESULTS_ID_DB.DRAW,
        })
      );
    }
    this.includeDBData = new IncludeDBData(DBGameData, this, this.match);
  }

  public placePieceInPos(pos: Pos, piece: AnyPieceModel | null): void {
    if (piece === null) {
      this.setPiece(null, pos);
      return;
    }
    this.setPiece(piece, pos);
  }

  private switchCurrTeam(): void {
    this.currTeam = BoardModel.getOpositeTeam(this.currTeam);
  }

  public async movePiece(
    from: Pos,
    to: Pos,
    promotedTo: PIECES | null,
    isIncludingFromDB: boolean = false
  ): Promise<boolean> {
    const piece = this.getPiece(from);
    if (piece === null) {
      throw new Error("Cannot move piece that is null");
    }
    const capturedPiece = this.getPiece(to);
    const enemyKing = this.getKingByTeam(piece.enemyTeamNum);
    const promotedToPiece = this.createNewPieceObj(
      promotedTo,
      piece.team,
      this
    );
    this.switchCurrTeam();
    this.removePieceInPos(from);
    this.placePieceInPos(
      to,
      promotedToPiece === null ? piece : promotedToPiece
    );
    const newHalfmove = new Halfmove(
      piece,
      from,
      to,
      capturedPiece,
      enemyKing.isInCheck() ? enemyKing.pos : null,
      PieceModel.isKing(piece) && KingModel.isMoveCastling(from, to),
      promotedToPiece
    );
    if (!isIncludingFromDB && this.fetchToDB !== null) {
      const ok = await this.fetchToDB.postHalfmove(
        newHalfmove,
        this.movesSystem.getHalfmovesAmount() + 1
      );
      if (!ok) {
        this.switchCurrTeam();
        this.placePieceInPos(from, piece);
        this.placePieceInPos(to, capturedPiece);
        return false;
      }
    }
    this.movesSystem.pushNewHalfmove(newHalfmove);
    piece.sideEffectsOfMove(to, from);
    if (!isIncludingFromDB) {
      this.match?.checkIfGameShouldEndAfterMove(newHalfmove);
    }
    return true;
  }

  public removePieceInPos(pos: Pos) {
    this.setPiece(null, pos);
  }

  private createKingsObj(pieces: ArrOfPieces2d): KingsObj | null {
    let kingWhite: null | KingModel = null;
    let kingBlack: null | KingModel = null;
    for (let r = 0; r < pieces.length; r++) {
      for (let c = 0; c < pieces[r].length; c++) {
        const piece = pieces[r][c];
        if (PieceModel.isKing(piece)) {
          switch (piece.team) {
            case TEAMS.WHITE:
              if (kingWhite !== null) {
                return null;
              }
              kingWhite = piece;
              break;
            case TEAMS.BLACK:
              if (kingBlack !== null) {
                return null;
              }
              kingBlack = piece;
              break;
          }
        }
      }
    }
    return kingWhite === null || kingBlack === null
      ? null
      : { white: kingWhite, black: kingBlack };
  }

  public isDrawByInsufficientMaterial(): boolean {
    return (
      this.isPositionKingVsKing() ||
      this.isPositionKingAndBishopVsKing() ||
      this.isPositionKingAndKnightVsKing() ||
      this.isPositionKingAndBishopVsKingAndBishop() // both bishops on squeres of the same color
    );
  }

  private isPositionKingVsKing(): boolean {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        if (this.isPosOccupied(pos) && !PieceModel.isKing(this.getPiece(pos))) {
          return false;
        }
      }
    }
    return true;
  }

  private isPositionKingAndBishopVsKing(): boolean {
    return this.isPositionKingAndSomePieceVsKing(PIECES.BISHOP);
  }

  private isPositionKingAndKnightVsKing(): boolean {
    return this.isPositionKingAndSomePieceVsKing(PIECES.KNIGHT);
  }

  private isPositionKingAndSomePieceVsKing(
    pieceId: PIECES.BISHOP | PIECES.KNIGHT
  ): boolean {
    let pieceOccurrencesCounter = 0;
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const piece = this.getPiece(pos);
        if (piece?.id === pieceId) {
          if (pieceOccurrencesCounter > 0) {
            return false;
          }
          pieceOccurrencesCounter++;
          continue;
        }
        if (this.isPosOccupied(pos) && !PieceModel.isKing(piece)) {
          return false;
        }
      }
    }
    return true;
  }

  private isPositionKingAndBishopVsKingAndBishop(): boolean {
    // both bishops on squeres of the same color
    const bishops: Pos[] = [];
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const piece = this.getPiece(pos);
        if (!this.isPosOccupied(pos) || PieceModel.isKing(piece)) {
          continue;
        }
        if (!PieceModel.isBishop(piece)) {
          return false;
        }
        if (bishops.length >= 2) {
          return false;
        }
        bishops.push(pos);
      }
    }
    return this.isTwoEnemyBishopsOnTheSameColor(bishops);
  }

  private isTwoEnemyBishopsOnTheSameColor(bishopsPos: Pos[]): boolean {
    if (bishopsPos.length !== 2) {
      return false;
    }
    const bishop1 = this.getPiece(bishopsPos[0]) as BishopModel;
    const bishop2 = this.getPiece(bishopsPos[1]) as BishopModel;

    return (
      bishop1.team !== bishop2.team &&
      this.isPositionsOnTheSameColor(bishopsPos[0], bishopsPos[1])
    );
  }

  private isPositionsOnTheSameColor(pos1: Pos, pos2: Pos): boolean {
    const modRes1 = pos1.x % 2;
    const modRes2 = pos2.x % 2;
    const isModEqual = modRes1 === modRes2;
    return pos1.y % 2 === pos2.y % 2 ? isModEqual : !isModEqual;
  }

  public isDrawByNoCapturesOrPawnMovesIn50Moves(): boolean {
    const halfmoves = this.movesSystem.halfmoves;
    if (halfmoves.length < 50) {
      return false;
    }
    for (let i = halfmoves.length - 1; i > halfmoves.length - 1 - 50; i--) {
      if (
        halfmoves[i].capturedPiece !== null ||
        PieceModel.isPawn(halfmoves[i].piece)
      ) {
        return false;
      }
    }
    return true;
  }

  public isDrawByThreeMovesRepetition(): boolean {
    const halfmoves = this.movesSystem.halfmoves;
    if (halfmoves.length < 6) {
      return false;
    }
    const lastMoveNum = halfmoves.length - 1;
    const p1Moves = [
      halfmoves[lastMoveNum - 4],
      halfmoves[lastMoveNum - 2],
      halfmoves[lastMoveNum],
    ];
    const p2Moves = [
      halfmoves[lastMoveNum - 5],
      halfmoves[lastMoveNum - 3],
      halfmoves[lastMoveNum - 1],
    ];

    return (
      // trust, it works
      p1Moves[0].from.isEqualTo(p1Moves[1].to) &&
      p1Moves[1].from.isEqualTo(p1Moves[2].to) &&
      p2Moves[0].from.isEqualTo(p2Moves[1].to) &&
      p2Moves[1].from.isEqualTo(p2Moves[2].to) &&
      p1Moves[0].piece === p1Moves[2].piece &&
      p2Moves[0].piece === p2Moves[2].piece &&
      PieceModel.isArrContainingEqualPieces(
        p1Moves[0].capturedPiece,
        p1Moves[1].capturedPiece,
        p1Moves[2].capturedPiece
      ) && // true if all captures are null since every piece can only be captured once
      PieceModel.isArrContainingEqualPieces(
        p2Moves[0].capturedPiece,
        p2Moves[1].capturedPiece,
        p2Moves[2].capturedPiece
      ) // true if all captures are null since every piece can only be captured once
    );
  }

  public createNewPieceObj(
    id: PIECES | null,
    team: TEAMS | null,
    board: BoardModel
  ): AnyPieceModel | null {
    if (id === null || team === null) {
      return null;
    }

    switch (id) {
      case PIECES.PAWN:
        return new PawnModel(team, board);
      case PIECES.ROOK:
        return new RookModel(team, board);
      case PIECES.KNIGHT:
        return new KnightModel(team, board);
      case PIECES.BISHOP:
        return new BishopModel(team, board);
      case PIECES.QUEEN:
        return new QueenModel(team, board);
      case PIECES.KING:
        return new KingModel(team, board);
      default:
        return null;
    }
  }

  public isPlayerAbleToMakeMove(team: TEAMS): boolean {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const piece = this.getPiece(pos);
        if (piece?.team === team) {
          const possMoves = piece.createArrOfPossibleMovesFromPos(pos);
          if (
            //possMoves[0]: first pos is where piece is placed
            possMoves.length !== 0 &&
            (possMoves.length > 1 || !possMoves[0].isEqualTo(pos))
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public isPawnPromotingAtMove(from: Pos, to: Pos): boolean {
    const pawn = this.getPiece(from);
    return PieceModel.isPawn(pawn) && pawn.isPosOfPromotion(to);
  }

  public isPosOccupied(pos: Pos) {
    return this.getPiece(pos) !== null;
  }

  public setPiece(piece: AnyPieceModel | null, pos: Pos): void {
    this.pieces[pos.y][pos.x] = piece;
  }

  public getPiece(pos: Pos): AnyPieceModel | null {
    return this.pieces[pos.y][pos.x];
  }

  public getKingByTeam(team: TEAMS): KingModel {
    return team === TEAMS.WHITE ? this.kings.white : this.kings.black;
  }

  public getKingPosByTeam(team: TEAMS): Pos {
    return this.getKingByTeam(team).pos;
  }

  public getCastlingRightsByTeam(isWhite: boolean): KingCastlingRights {
    return isWhite ? this.castlingRights.white : this.castlingRights.black;
  }

  public getCastlingRights(): CastlingRights {
    return this.castlingRights;
  }

  public getPiecesCopy(): ArrOfPieces2d {
    return [...this.pieces.map((row) => [...row])];
  }
  public getCurrTeam() {
    return this.currTeam;
  }

  get startQueenPosWhite(): Pos {
    const queenDefaultXPos = 3;
    const startYPos = FIELDS_IN_ONE_ROW - 1;
    return new Pos(startYPos, queenDefaultXPos);
  }

  get startKingPosWhite(): Pos {
    const kingDefaultXPos = 4;
    const startYPos = FIELDS_IN_ONE_ROW - 1;
    return new Pos(startYPos, kingDefaultXPos);
  }

  get startQueenPosBlack(): Pos {
    const queenDefaultXPos = 3;
    const startYPos = 0;
    return new Pos(startYPos, queenDefaultXPos);
  }

  get startKingPosBlack(): Pos {
    const kingDefaultXPos = 4;
    const startYPos = 0;
    return new Pos(startYPos, kingDefaultXPos);
  }

  public static getOpositeTeam(currTeam: TEAMS) {
    return currTeam === TEAMS.WHITE ? TEAMS.BLACK : TEAMS.WHITE;
  }

  public static isPosInBounds(pos: Pos): boolean {
    return (
      pos.x >= 0 &&
      pos.x <= FIELDS_IN_ONE_ROW - 1 &&
      pos.y >= 0 &&
      pos.y <= FIELDS_IN_ONE_ROW - 1
    );
  }
}
