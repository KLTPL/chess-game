import BoardView from "../view/BoardView";
import Player from "./Player";
import Halfmove from "../model/Halfmove";
import {
  END_REASONS_ID_DB,
  GAME_RESULTS_ID_DB,
  type GetDBGameData,
  type PutDBGame,
} from "../../../../db/types";
import FetchToDB from "../model/FetchToDB";
import BoardModel from "../model/BoardModel";
import { PIECES, TEAMS } from "../../pieces/model/PieceModel";
import type { PieceViewData } from "../view/Field";
import AnalisisSystem from "./AnalisisSystem";
import Pos from "../model/Pos";
import type PieceView from "../../pieces/view/PieceView";
import {
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT,
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
} from "../view/DragAndDropPieces";
import type { GetOnlineGame } from "../../../../pages/api/online-game/[display_id].json";

type Players = {
  white: Player;
  black: Player;
};

export type BoardArg = {
  htmlPageContainerQSelector: string;
  DBGameData?: GetDBGameData;
  customPositionFEN: string | null;
};

export type EndInfo = Pick<PutDBGame, "result_id" | "end_reason_id"> &
  Partial<Pick<PutDBGame, "id">>;

export default class MatchController {
  public isGameRunning: Boolean = true;
  public players: Players;
  public endInfo: EndInfo | null = null;
  readonly boardModel: BoardModel;
  readonly boardView: BoardView;
  public analisisSystem: AnalisisSystem = null as never;
  readonly userTeam: TEAMS | null;
  readonly isConnectedToDB: boolean;
  constructor(boardArg: BoardArg, getOnlineGame: GetOnlineGame | null) {
    this.isConnectedToDB = getOnlineGame !== null;
    const DBGameData =
      getOnlineGame === null ? null : getOnlineGame.getDBGameData;
    this.userTeam = this.getUserTeam(getOnlineGame);
    this.boardModel = new BoardModel(
      boardArg.customPositionFEN,
      DBGameData,
      this
    );
    const pieces = this.boardModel.getPiecesCopy();
    const pieceVD: PieceViewData[][] = pieces.map((row) =>
      row.map((piece) => {
        return piece === null ? null : { id: piece.id, team: piece.team };
      })
    );
    this.boardView = new BoardView(
      pieceVD,
      false,
      boardArg.htmlPageContainerQSelector,
      this
    );
    this.players = {
      white: new Player(TEAMS.WHITE, DBGameData),
      black: new Player(TEAMS.BLACK, DBGameData),
    };
    if (this.boardModel.fetchToDB !== null) {
      const isIncluding = this.boardModel.includeDBData.getIsIncluding();
      if (isIncluding !== false) {
        isIncluding.then(() => this.includeDBDataToView());
      } else {
        this.includeDBDataToView();
      }
    }
    setTimeout(() => (this.analisisSystem = new AnalisisSystem(this))); // setTimeout so the constructor is finished and the class can use it (passing 'this' as argument)
  }
  private getUserTeam(getOnlineGame: GetOnlineGame | null) {
    if (getOnlineGame !== null) {
      if (getOnlineGame.userId === getOnlineGame.getDBGameData.game.user_w_id) {
        return TEAMS.WHITE;
      } else if (
        getOnlineGame.userId === getOnlineGame.getDBGameData.game.user_b_id
      ) {
        return TEAMS.BLACK;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private async includeDBDataToView() {
    for (const halfmove of this.boardModel.movesSystem.halfmoves) {
      await this.boardView.movePiece(
        halfmove.from,
        halfmove.to,
        halfmove.piece.team,
        true,
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
      );
      this.boardView.changeBasedOnHalfmove(halfmove);
      this.boardView.setCssGrabOnPiececCorrectly(this.getCurrTeam());
    }
  }

  public async movePiece(from: Pos, to: Pos) {
    const v = this.boardView;
    const pieceV = v.getField(from).getPiece();
    const capturedPieceV = v.getField(to).getPiece();

    const promoted = await this.moveView(from, to);

    const ok = await this.moveModel(from, to, promoted);

    if (!ok) {
      this.revertMove(from, to, pieceV, capturedPieceV);
      return;
    }

    v.changeBasedOnHalfmove(this.boardModel.movesSystem.getLatestHalfmove());
  }

  private async moveView(from: Pos, to: Pos) {
    const v = this.boardView;
    const m = this.boardModel;
    const piece = m.getPiece(from);
    if (piece === null) {
      throw new Error("Cannot move piece that is null");
    }
    const promoted = await v.movePiece(
      from,
      to,
      piece.team,
      false,
      CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
    );
    return promoted;
  }
  private async moveModel(from: Pos, to: Pos, promoted: PIECES | null) {
    const m = this.boardModel;
    const ok = await m.movePiece(from, to, promoted, false);
    return ok;
  }
  private revertMove(
    from: Pos,
    to: Pos,
    pieceV: PieceView | null,
    capturedPieceV: PieceView | null
  ) {
    const v = this.boardView;
    v.showEventsOnBoard.stopShowingCheck();
    v.showEventsOnBoard.stopShowingLastMove();
    v.removePieceInPos(to, true);
    v.placePieceInPos(
      to,
      capturedPieceV,
      CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
      true
    );
    v.placePieceInPos(
      from,
      pieceV,
      CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
      true
    );
  }

  public checkIfGameShouldEndAfterMove(move: Halfmove): void {
    const otherKing = this.boardModel.getKingByTeam(move.piece.enemyTeamNum);
    const dbGameId =
      this.boardModel.fetchToDB === null
        ? undefined
        : this.boardModel.fetchToDB.game_id;

    if (this.boardModel.isDrawByInsufficientMaterial()) {
      this.end({
        id: dbGameId,
        end_reason_id: END_REASONS_ID_DB.INSUFFICENT,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      });
      return;
    }
    if (this.boardModel.isDrawByThreeMovesRepetition()) {
      this.end({
        id: dbGameId,
        end_reason_id: END_REASONS_ID_DB.REPETITION,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      });
      return;
    }
    if (this.boardModel.isDrawByNoCapturesOrPawnMovesIn50Moves()) {
      this.end({
        id: dbGameId,
        end_reason_id: END_REASONS_ID_DB.MOVE_RULE_50,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      });
      return;
    }

    if (!this.boardModel.isPlayerAbleToMakeMove(move.piece.enemyTeamNum)) {
      if (otherKing.isInCheck()) {
        const resultId = move.piece.isWhite()
          ? GAME_RESULTS_ID_DB.WHITE
          : GAME_RESULTS_ID_DB.BLACK;
        this.end({
          id: dbGameId,
          end_reason_id: END_REASONS_ID_DB.CHECKMATE,
          result_id: resultId,
        });
      } else {
        const resultId = !move.piece.isWhite()
          ? GAME_RESULTS_ID_DB.WHITE
          : GAME_RESULTS_ID_DB.BLACK;
        this.end({
          id: dbGameId,
          end_reason_id: END_REASONS_ID_DB.STALEMATE,
          result_id: resultId,
        });
      }
    }
  }

  public end(endInfo: EndInfo): void {
    this.isGameRunning = false;
    this.endInfo = endInfo;
    this.boardView.showEventsOnBoard.turnOfCssGrabOnPieces();
    console.log("half moves: ", this.boardModel.movesSystem.halfmoves);

    if (endInfo.id !== undefined) {
      this.boardModel.fetchToDB?.putGameStatus(endInfo as PutDBGame);
    }

    console.log("Koniec gry");
    this.printEndInfo(endInfo);
  }

  private async printEndInfo(endInfo: EndInfo) {
    try {
      const resultName = await FetchToDB.getResultName(endInfo.result_id);
      const endReasonName = await FetchToDB.getEndReasonName(
        endInfo.end_reason_id
      );
      console.log(
        `Gra zakończyła się. Wynik: ${resultName}, powód: ${endReasonName}`
      );
    } catch (err) {
      console.error(err);
    }
  }

  public getPossMovesFromPos(pos: Pos): Pos[] {
    const piece = this.boardModel.getPiece(pos);
    if (piece === null) {
      throw new Error(
        `There is no piece at provided position (x = ${pos.x}, y = ${pos.y})`
      );
    }
    return piece.createArrOfPossibleMovesFromPos(pos);
  }
  public getPieceTeamAtPos(pos: Pos): TEAMS {
    const piece = this.boardModel.getPiece(pos);
    if (piece === null) {
      throw new Error(
        `There is no piece at provided position (x = ${pos.x}, y = ${pos.y})`
      );
    }
    return piece.team;
  }

  public getTeamOfUserToMove(currTeam: TEAMS) {
    const userTeam = this.userTeam;
    if (this.isConnectedToDB) {
      if (userTeam === currTeam) {
        return userTeam;
      }
    } else {
      return currTeam;
    }
    return null;
  }

  public getHalfmoves(): Halfmove[] {
    return this.boardModel.movesSystem.halfmoves;
  }
  public getCurrTeam(): TEAMS {
    return this.boardModel.getCurrTeam();
  }
}
