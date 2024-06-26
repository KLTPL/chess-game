// import all css files
import "../../../../styles/board/Board.css";
import "../../../../styles/board/boardEvents.css";
import "../../../../styles/board/pieces.css";
import "../../../../styles/board/playerBar.css";
import "../../../../styles/board/promoteMenu.css";
import "../../../../styles/board/visualisationSystem.css";
import "../../../../styles/board/gameEndPopup.css";
// regular imports
import Pos, { POS_OUT_OF_BOARD } from "../model/Pos";
import Field, { type PieceViewData } from "./Field";
import VisualizingSystem from "./VisualizingSystem";
import PawnPromotionMenu from "./PawnPromotionMenu";
import MatchController from "../controller/MatchController";
import ShowEvetsOnBoard from "./ShowEventsOnBoard";
import { FIELDS_IN_ONE_ROW } from "../model/BoardModel";
import DragAndDropPieces, {
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT,
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
} from "./DragAndDropPieces";
import PieceView from "../../pieces/view/PieceView";
import { TEAMS, type PIECES } from "../../pieces/model/PieceModel";
import type Halfmove from "../model/Halfmove";
import PieceModel from "../../pieces/model/PieceModel";
import KingModel from "../../pieces/model/KingModel";
import BoardHTMLFactory, {
  BUTTON_ID_BACK,
  BUTTON_ID_FORWARD,
  CLASS_NAMES,
} from "./BoardHTMLFactory";
import PlayerHTMLBars from "./PlayerHTMLBars";
import GameEndPopup from "./GameEndPopup";

export type LangDicts = {
  gameDict: Record<string, string>;
  gameEndPopupDict: Record<string, string>;
};

export default class BoardView {
  private fields: Field[][] = [];
  readonly html: HTMLDivElement = BoardHTMLFactory.createBoardContainer();
  readonly fieldsHtml: HTMLDivElement =
    BoardHTMLFactory.createContainerForFields();
  readonly piecesHtml: HTMLDivElement =
    BoardHTMLFactory.createContainerForPieces();
  readonly playerHTMLBars: PlayerHTMLBars;
  readonly pageContainerHtml: HTMLDivElement;
  readonly pawnPromotionMenu: PawnPromotionMenu = new PawnPromotionMenu();
  readonly resultPopup: GameEndPopup;
  public showEventsOnBoard: ShowEvetsOnBoard;
  private dragAndDropPieces: DragAndDropPieces = new DragAndDropPieces(this);
  constructor(
    pieces: PieceViewData[][],
    public isInverted: boolean,
    htmlPageContainerQSelector: string,
    langDicts: LangDicts,
    readonly match: MatchController
  ) {
    this.showEventsOnBoard = new ShowEvetsOnBoard(this, this.match);
    this.pageContainerHtml = document.querySelector(
      htmlPageContainerQSelector
    ) as HTMLDivElement;
    this.html.append(this.fieldsHtml);
    this.html.append(this.piecesHtml);
    this.html.append(BoardHTMLFactory.createContainerForButtons(this));
    this.pageContainerHtml.append(this.html);
    this.resizeHtml();
    this.setCssVariables();
    this.positionHtmlProperly();

    this.fields = this.createFieldsArr(isInverted);
    this.setPosition(pieces);

    if (this.match.userTeam === TEAMS.BLACK) {
      this.invert();
    }

    this.playerHTMLBars = new PlayerHTMLBars(
      langDicts.gameDict["game-type"],
      this
    );
    this.resultPopup = new GameEndPopup(langDicts.gameEndPopupDict);

    new VisualizingSystem(this);

    window.addEventListener("resize", () => {
      this.resizeHtml();
      this.positionHtmlProperly();
      this.setCssVariables();
      this.positionAllPiecesHtmlsProperly();
    });
  }

  public setCssGrabOnPiececCorrectly(currTeam: TEAMS) {
    const s = this.showEventsOnBoard;
    const team = this.match.getTeamOfUserToMove(currTeam);
    s.turnOfCssGrabOnPieces();
    if (this.match.isGameRunning && team !== null) {
      s.turnOnCssGrabOnPieces(team);
    }
  }

  public setPosition(pieces: PieceViewData[][]) {
    const place = (pos: Pos, piece: PieceViewData) => {
      this.getField(pos).placePiece(
        piece,
        pos,
        this.piecesHtml,
        this.isInverted
      );
    };

    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        this.removePieceInPos(pos, true);
        place(pos, pieces[r][c]);
      }
    }

    this.showEventsOnBoard.showLastMoveAndCheck();
    this.positionAllPiecesHtmlsProperly();
    this.setCssGrabOnPiececCorrectly(this.match.getCurrTeam());
  }

  private createFieldsArr(isInverted: boolean): Field[][] {
    const el: Field[][] = [];
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      el[r] = [];
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        el[r][c] = new Field(new Pos(r, c), isInverted, null, this.piecesHtml);
        el[r][c].appendSelfToEl(this.fieldsHtml);
      }
    }
    return el;
  }

  public calcFieldPosByPx(leftPx: number, topPx: number): Pos {
    // pos values from 0 to 7 or -1 if not in board
    const boardBoundingRect = this.html.getBoundingClientRect();
    const posOnBoardLeft = leftPx - boardBoundingRect.left;
    const posOnBoardTop = topPx - boardBoundingRect.top;
    const fieldC = Math.floor(
      (posOnBoardLeft / boardBoundingRect.width) * FIELDS_IN_ONE_ROW
    );
    const fieldR = Math.floor(
      (posOnBoardTop / boardBoundingRect.height) * FIELDS_IN_ONE_ROW
    );
    return new Pos(
      fieldR >= 0 && fieldR <= FIELDS_IN_ONE_ROW - 1
        ? fieldR
        : POS_OUT_OF_BOARD,
      fieldC >= 0 && fieldC <= FIELDS_IN_ONE_ROW - 1 ? fieldC : POS_OUT_OF_BOARD
    );
  }

  public placePieceInPos(
    pos: Pos,
    piece: PieceView | null,
    cssPieceTransitionDelayMs: number,
    appendHtml: boolean
  ): void {
    if (piece === null) {
      this.getField(pos).setPiece(null);
      return;
    }
    if (appendHtml) {
      piece.appendSelfToEl(this.piecesHtml);
    }
    piece.setCssTransitionDeley(cssPieceTransitionDelayMs);
    piece.transformHtmlToPos(pos, this.isInverted);
    setTimeout(
      () =>
        piece.setCssTransitionDeley(CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE),
      cssPieceTransitionDelayMs
    );
    this.getField(pos).setPiece(piece);
  }

  public removePieceInPos(pos: Pos, removeHtml: boolean) {
    if (removeHtml) {
      this.getField(pos).getPiece()?.removeHtml();
    }
    this.getField(pos).setPiece(null);
  }

  public async movePiece(
    // returns piece number (PIECES) if there is a promotion or null if not
    from: Pos,
    to: Pos,
    team: TEAMS,
    isIncludingFromDB: boolean,
    transitionDelayMs: number
  ): Promise<PIECES | null> {
    const piece = this.getField(from).getPiece();
    if (piece === null) {
      throw new Error("Cannot move a piece that is null");
    }
    const capturedPiece = this.getField(to).getPiece();
    if (capturedPiece !== null) {
      this.removePieceInPos(to, true);
    }
    this.removePieceInPos(from, false);
    this.placePieceInPos(to, piece, transitionDelayMs, false);
    if (!isIncludingFromDB) {
      piece.sideEffectsOfMove(to, from, team, this);
    }

    return this.finishMovingPiece(to, from, team);
  }

  private async finishMovingPiece(
    to: Pos,
    from: Pos,
    team: TEAMS
  ): Promise<PIECES | null> {
    const afterMoveIsFinished = (piecePromotedTo: PIECES | null = null) => {
      if (piecePromotedTo !== null) {
        this.removePieceInPos(to, true);
        this.placePieceInPos(
          to,
          new PieceView(
            piecePromotedTo,
            team,
            to,
            this.piecesHtml,
            this.isInverted
          ),
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT,
          false
        );
      }
      this.showEventsOnBoard.stopShowingCheck();
      this.showEventsOnBoard.showNewMoveClassification(to);
      this.showEventsOnBoard.showNewLastMove(from, to);
    };
    const choosingPromise = this.pawnPromotionMenu.getPlayerChoosingPromise();
    if (choosingPromise !== null) {
      const promotedTo: PIECES = await choosingPromise;
      afterMoveIsFinished(promotedTo);
      return promotedTo;
    } else {
      afterMoveIsFinished();
      return null;
    }
  }

  public changeBasedOnHalfmove(halfmove: Halfmove) {
    this.setCssGrabOnPiececCorrectly(this.match.getCurrTeam());
    const v = this;

    const kingCheckedPos = halfmove.posOfKingChecked;
    if (kingCheckedPos !== null) {
      v.showEventsOnBoard.showCheck(kingCheckedPos);
    }
    if (halfmove.isEnPassantCapture() && PieceModel.isPawn(halfmove.piece)) {
      v.removePieceInPos(
        halfmove.piece.getPosOfPieceCapturedByEnPassant(halfmove.to),
        true
      );
    }

    const { from, to, piece } = halfmove;
    if (
      PieceModel.isKing(piece) &&
      KingModel.isMoveCastling(halfmove.from, halfmove.to)
    ) {
      const { newRookPos, oldRookPos } =
        KingModel.calcRookPossitionsForCastlingMove(from, to);
      const movingRook = v.getField(oldRookPos).getPiece();
      v.removePieceInPos(oldRookPos, false);
      v.placePieceInPos(
        newRookPos,
        movingRook,
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT * 3.5,
        false
      );
    }
  }

  public async invert() {
    this.isInverted = !this.isInverted;
    await this.match.waitForAnalisisSystemCreation();
    this.match.analisisSystem.goBackToCurrMoveIfUserIsAnalising();
    const pieces: PieceViewData[][] = this.match.boardModel
      .getPiecesCopy()
      .map((row) =>
        row.map((piece) => {
          return piece === null
            ? null
            : {
                id: piece.id,
                team: piece.team,
              };
        })
      );
    this.setPosition(pieces);
    this.playerHTMLBars.appendNewBars();
  }

  private positionHtmlProperly(): void {
    /*
    this.html.getBoundingClientRect().left and .top have to be int, 
    becouse MouseEvent.clinetX and .clientY is int.
    this is important in the Board.calcFieldPosByPx function, whitch uses .clientX and .clinetY.
    */
    this.html.style.left = "50%";
    this.html.style.top = "50%";
    this.html.style.setProperty("--translateX", "-50%");
    this.html.style.setProperty("--translateY", "-50%");

    const bounding = this.html.getBoundingClientRect();
    if (bounding.left !== Math.floor(bounding.left)) {
      this.html.style.left = `${Math.floor(bounding.left).toString()}px`;
      this.html.style.setProperty("--translateX", "0%");
    }
    if (bounding.top !== Math.floor(bounding.top)) {
      this.html.style.top = `${Math.floor(bounding.top).toString()}px`;
      this.html.style.setProperty("--translateY", "0%");
    }
  }

  private resizeHtml(): void {
    this.html.classList.add(CLASS_NAMES.thisHtmlDefaultWidth);
    const fieldSize =
      this.html.getBoundingClientRect().width / FIELDS_IN_ONE_ROW;
    if (fieldSize !== Math.floor(fieldSize)) {
      //field size has to be int-read the Board.positionHtmlProperly comment
      this.html.classList.remove(CLASS_NAMES.thisHtmlDefaultWidth);
      this.html.style.setProperty(
        "--customWidth",
        `${Math.floor(fieldSize) * FIELDS_IN_ONE_ROW}px`
      );
    }
  }

  private setCssVariables(): void {
    const root = document.querySelector(":root") as HTMLElement;
    const fieldSize = this.html.offsetWidth / FIELDS_IN_ONE_ROW; // field size will allways be int thanks to Board.resizeHtml function
    root.style.setProperty("--pieceSize", `${fieldSize}px`);
    root.style.setProperty("--pieceMoveTouchSize", `${fieldSize * 2}px`);
    root.style.setProperty("--fieldLabelFontSize", `${fieldSize * 0.35}px`);
  }

  private positionAllPiecesHtmlsProperly(): void {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const field = this.getField(pos);
        if (field.isOccupied()) {
          field.getPiece()?.transformHtmlToPos(pos, this.isInverted);
        }
      }
    }
  }

  public onPointerDown(listener: (ev: PointerEvent) => void) {
    this.piecesHtml.addEventListener("pointerdown", listener);
  }
  public onButtonForward(listener: (ev: Event) => void) {
    document
      .querySelector(`#${BUTTON_ID_FORWARD}`)
      ?.addEventListener("click", listener);
  }
  public onButtonBack(listener: (ev: Event) => void) {
    document
      .querySelector(`#${BUTTON_ID_BACK}`)
      ?.addEventListener("click", listener);
  }
  public onKeyDown(listener: (ev: KeyboardEvent) => void) {
    window.addEventListener("keydown", listener);
  }
  public onMouseDown(listener: (ev: MouseEvent) => void) {
    window.addEventListener("mousedown", listener);
  }

  public getField(pos: Pos): Field {
    pos = pos.getInvProp(this.isInverted);
    return this.fields[pos.y][pos.x];
  }
  public getSelectedPieceData() {
    return this.dragAndDropPieces.getSelectedPieceData();
  }

  public setField(field: Field, pos: Pos): void {
    pos = pos.getInvProp(this.isInverted);
    this.fields[pos.y][pos.x] = field;
  }
}
