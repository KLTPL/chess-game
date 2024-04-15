import BoardView from "../view/BoardView";
import Player from "./Player";
import Halfmove from "../model/Halfmove";
import {
  END_REASONS_ID_DB,
  GAME_RESULTS_ID_DB,
  type GetDBGameData,
  type GetOnlineGame,
  type EndInfo,
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
import MatchEnd from "./MatchEnd";

export type Players = {
  white: Player;
  black: Player;
};

export type BoardArg = {
  htmlPageContainerQSelector: string;
  DBGameData?: GetDBGameData;
  customPositionFEN: string | null;
};

export default class MatchController {
  public isGameRunning: Boolean = true;
  readonly players: Players;
  public endInfo: EndInfo | null = null;
  readonly boardModel: BoardModel;
  readonly boardView: BoardView;
  public analisisSystem: AnalisisSystem = null as never;
  public isAnalisisSystemCreated: Promise<void> | true;
  readonly userTeam: TEAMS | null;
  readonly isGameOnline: boolean;
  constructor(boardArg: BoardArg, getOnlineGame: GetOnlineGame | null) {
    this.isGameOnline = getOnlineGame !== null;
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
    this.players = {
      white: new Player(TEAMS.WHITE, DBGameData, this),
      black: new Player(TEAMS.BLACK, DBGameData, this),
    };
    this.boardView = new BoardView(
      pieceVD,
      false,
      boardArg.htmlPageContainerQSelector,
      this
    );
    if (this.boardModel.fetchToDB !== null) {
      this.boardModel.includeDBData
        .waitUntilIncludesDBData()
        .then(() => this.includeDBDataToView());
    }
    this.isAnalisisSystemCreated = new Promise<void>((resolve) => {
      setTimeout(() => {
        this.analisisSystem = new AnalisisSystem(this);
        resolve();
      }); // setTimeout so the constructor is finished and the class can use it (passing 'this' as argument)
    });
    this.isAnalisisSystemCreated.then(
      () => (this.isAnalisisSystemCreated = true)
    );
  }
  public async waitForAnalisisSystemCreation() {
    if (this.isAnalisisSystemCreated !== true) {
      await this.isAnalisisSystemCreated;
      await new Promise((resolve) => {
        setTimeout(resolve);
      });
    }
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
    const pieceVD: PieceViewData[][] = this.boardModel
      .getPiecesCopy()
      .map((row) =>
        row.map((piece) => {
          return piece === null ? null : { id: piece.id, team: piece.team };
        })
      );
    this.boardView.setPosition(pieceVD);
    this.boardView.playerHTMLBars.appendNewBars();
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

    v.playerHTMLBars.appendNewBars();
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

  public checkIfGameShouldEndAfterMove(): void {
    const ret = MatchEnd.checkIfGameShouldEndAfterMove(this.boardModel);
    if (ret !== false) {
      this.end(ret);
    }
  }

  public end(endInfo?: EndInfo): void {
    this.isGameRunning = false;

    this.boardView.showEventsOnBoard.turnOfCssGrabOnPieces();

    if (endInfo !== undefined) {
      this.endInfo = endInfo;

      this.showEndInfo(endInfo);
    }
  }

  private async showEndInfo(endInfo: EndInfo) {
    try {
      const resultName = await FetchToDB.getResultName(endInfo.result_id);
      const endReasonName = await FetchToDB.getEndReasonName(
        endInfo.end_reason_id
      );
      if (resultName !== null && endReasonName !== null) {
        this.boardView.resultPopup.show(
          {
            resultId: endInfo.result_id,
            resultName,
            endReasonName,
            playerW: this.players.white,
            playerB: this.players.black,
            isGameOnline: this.isGameOnline,
          },
          this.boardView
        );
      }
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
    if (this.isGameOnline) {
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
  public getHalfmovesAmount() {
    return this.boardModel.movesSystem.getHalfmovesAmount();
  }
  public getLatestHalfmove() {
    return this.boardModel.movesSystem.getLatestHalfmove();
  }
  public getHalfmoveAt(idx: number) {
    return this.boardModel.movesSystem.getHalfmoveAt(idx);
  }
  public getCurrTeam(): TEAMS {
    return this.boardModel.getCurrTeam();
  }
}
