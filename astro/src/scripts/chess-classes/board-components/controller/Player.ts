import type { GetDBGameData } from "../../../../db/types";
import PieceModel, { TEAMS } from "../../pieces/model/PieceModel";
import { FIELDS_IN_ONE_ROW } from "../model/BoardModel";
import Pos from "../model/Pos";
import type MatchController from "./MatchController";

export type CapturedPiecesCount = {
  pawns: number;
  bishops: number;
  knights: number;
  rooks: number;
  queens: number;
};

export default class Player {
  private name: string;
  private displayName: string;
  constructor(
    private team: TEAMS,
    DBGameData: GetDBGameData | null,
    private match: MatchController
  ) {
    if (DBGameData === null) {
      this.name = this.team === TEAMS.WHITE ? "białe" : "czarne";
      this.displayName = this.team === TEAMS.WHITE ? "białe" : "czarne";
    } else {
      this.name =
        this.team === TEAMS.WHITE
          ? DBGameData.game.user_w_name
          : DBGameData.game.user_b_name;
      this.displayName =
        this.team === TEAMS.WHITE
          ? DBGameData.game.user_w_display_name
          : DBGameData.game.user_b_display_name;
    }
  }

  public countCapturedPoints(): number {
    const b = this.match.boardModel;

    let count = 0;
    let i = this.isWhite() ? 0 : 1;
    for (; i < b.movesSystem.getHalfmovesAmount(); i += 2) {
      const capturedPiece = b.movesSystem.getHalfmoveAt(i).capturedPiece;
      if (capturedPiece !== null) {
        count += capturedPiece.value;
      }
    }
    return count;
  }
  public getCapturedPiecesCount(): CapturedPiecesCount {
    const b = this.match.boardModel;
    const piecesCount: CapturedPiecesCount = {
      pawns: 0,
      bishops: 0,
      knights: 0,
      rooks: 0,
      queens: 0,
    };
    let i = this.isWhite() ? 0 : 1;
    for (; i < b.movesSystem.getHalfmovesAmount(); i += 2) {
      const capturedPiece = b.movesSystem.getHalfmoveAt(i).capturedPiece;
      if (PieceModel.isPawn(capturedPiece)) {
        piecesCount.pawns++;
      } else if (PieceModel.isBishop(capturedPiece)) {
        piecesCount.bishops++;
      } else if (PieceModel.isKnight(capturedPiece)) {
        piecesCount.knights++;
      } else if (PieceModel.isRook(capturedPiece)) {
        piecesCount.rooks++;
      } else if (PieceModel.isQueen(capturedPiece)) {
        piecesCount.queens++;
      }
    }
    return piecesCount;
  }

  public isWhite() {
    return this.team === TEAMS.WHITE;
  }

  public getTeam() {
    return this.team;
  }
  public getEnemyTeam() {
    return this.team === TEAMS.WHITE ? TEAMS.BLACK : TEAMS.WHITE;
  }
  public getName() {
    return this.name;
  }
  public getDisplayName() {
    return this.displayName;
  }
}
