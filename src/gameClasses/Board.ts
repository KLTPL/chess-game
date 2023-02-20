import Pos, { POS_OUT_OF_BOARD } from "./Pos.js";
import Field, { CLASS_NAMES as CLASS_NAMES_FIELD } from "./Field.js";
import Piece, { AnyPiece, PIECES, TEAMS, SelectedPieceInfo, CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE } from "./Pieces/Piece.js";
import Pawn from "./Pieces/Pawn.js";
import King from "./Pieces/King.js";
import Halfmove from "./Halfmove.js";
import VisualizingSystem from "./VisualizingSystem.js";
import PawnPromotionMenu from "./PawnPromotionMenu.js";
import Match from "./Match.js";
import FENNotation from "./FENNotation.js";
import Rook from "./Pieces/Rook.js";
import Knight from "./Pieces/Knight.js";
import Bishop from "./Pieces/Bishop.js";
import Queen from "./Pieces/Queen.js";
import MovesSystem from "./movesSystem.js";
import AnalisisSystem, { BUTTON_ID_BACK, BUTTON_ID_FORWARD } from "./AnalisisSystem.js";

export type ArrOfPieces2d = (AnyPiece|null)[][];

type KingsObj = {
  white: King,
  black: King,
};

export const hold = (element: HTMLElement, rejectEventType: string, timeMs: number) => {
  return new Promise<void>((resolve, reject) => {
    element.addEventListener(
      rejectEventType, () => {
        reject();
      },
      {once: true}
    );
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
}

export const FIELDS_IN_ONE_ROW = 8;

const CLASS_NAMES = {
  piece: "piece",
  thisHtml: "board-container",
  thisHtmlDefaultWidth: "board-container-default-width",
  fieldsContainer: "board-fields-container",
  piecesContainer: "board-pieces-container",
  buttonsContainer: "buttons-container",
  buttonArrow: "arrow-button",
};

export default class Board {
  public startFENNotation: FENNotation;
  public currTeam: TEAMS;
  public el: Field[][] = [];
  public html: HTMLDivElement = this.createBoardContainer();
  private fieldsHtml: HTMLDivElement = this.createContainerForFields();
  public piecesHtml: HTMLDivElement = this.createContainerForPieces();
  public pageContainerHtml: HTMLDivElement;
  public selectedPieceInfo: (SelectedPieceInfo|null) = null;
  public pawnPromotionMenu: (PawnPromotionMenu|null) = null;
  public isInverted: boolean;
  public movesSystem: MovesSystem = new MovesSystem(/*this*/);
  public analisisSystem: AnalisisSystem;
  private kings: KingsObj;
  private moveClassification: Pos|null = null;
  constructor(
    htmlPageContainerQSelector: string, 
    customPositionFEN: (string|null),
    public match: Match, 
  ) {
    this.startFENNotation = new FENNotation(customPositionFEN, this);
    this.currTeam = this.startFENNotation.activeColorConverted;
    this.isInverted = (this.currTeam !== TEAMS.WHITE);
    this.pageContainerHtml = document.querySelector(htmlPageContainerQSelector) as HTMLDivElement;

    this.html.append(this.fieldsHtml);
    this.html.append(this.piecesHtml);
    this.html.append(this.createContainerForButtons());
    this.pageContainerHtml.append(this.html);
    this.resizeHtml();
    this.setCssVariables();
    this.positionHtmlProperly();

    this.el = this.createFieldsArr();
    const pieces = this.startFENNotation.piecePlacementConverted;

    this.placePieces(pieces);
    if (this.isInverted) {
      this.invert();
    }
    new VisualizingSystem(this);
    this.analisisSystem = new AnalisisSystem(this);

    window.addEventListener("resize", () => {
      this.resizeHtml();
      this.positionHtmlProperly();
      this.setCssVariables();
      this.positionAllPiecesHtmlsProperly();
    });

    const kings = this.createKingsObj(pieces);
    const isThereExaclyTwoKingsOfOppositeTeam = (kings !== null);

    if (isThereExaclyTwoKingsOfOppositeTeam) {
      this.kings = {
        white: kings.white,
        black: kings.black,
      }
      this.kings.white.updatePosProperty();
      this.kings.black.updatePosProperty();
    } else {
      setTimeout(() => this.match.end({ cousedBy: null, type: "Bad kings"})); 
      //setTimeout so constructor is finished before calling Match.end
      this.kings = { white: new King(-1, this), black: new King(-1, this) };
      //this.kings doesn't matter because the game is already over
    }

    if (this.isDrawByInsufficientMaterial()) {
      setTimeout(() => this.match.end({ cousedBy: null, type: "draw"}));
    }
  }

  private createBoardContainer(): HTMLDivElement { // <div class="board-container"></div>
    const containerHtml = document.createElement("div");
    containerHtml.classList.add(CLASS_NAMES.thisHtml);
    return containerHtml;
  }

  private createContainerForFields(): HTMLDivElement { // <div class="board-fields-container"></div>
    const fieldsHtml = document.createElement("div");
    fieldsHtml.classList.add(CLASS_NAMES.fieldsContainer);
    fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return fieldsHtml;
  }

  private createContainerForPieces(): HTMLDivElement { // <div class="board-pieces-container"></div>
    const piecesHtml = document.createElement("div");
    piecesHtml.classList.add(CLASS_NAMES.piecesContainer);
    piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return piecesHtml;
  }

  private createContainerForButtons(): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add(CLASS_NAMES.buttonsContainer);
    const buttonBack = this.createButtonBack();
    const buttonForward = this.createButtonForward();
    const buttonInvert = this.createButtonInvert();
    container.append(buttonBack, buttonInvert, buttonForward);
    return container;
  }

  private createButtonBack(): HTMLButtonElement {
    const buttonBack = document.createElement("button");
    const innerDiv = document.createElement("div");
    innerDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>';
    buttonBack.id = BUTTON_ID_BACK;
    buttonBack.classList.add(CLASS_NAMES.buttonArrow);
    buttonBack.append(innerDiv);
    return buttonBack;
  }

  private createButtonForward(): HTMLButtonElement {
    const buttonFroward = document.createElement("button");
    const innerDiv = document.createElement("div");
    innerDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>';
    buttonFroward.id = BUTTON_ID_FORWARD;
    buttonFroward.classList.add(CLASS_NAMES.buttonArrow);
    buttonFroward.append(innerDiv);
    return buttonFroward;
  }

  private createButtonInvert(): HTMLButtonElement {
    const buttonInvert = document.createElement("button");
    buttonInvert.addEventListener("click", () => this.invert());
    buttonInvert.innerText = "obróć";
    return buttonInvert;
  }

  private setPieceCssTransitionDeley(htmlEl: HTMLDivElement, ms: number): void {
    htmlEl.style.setProperty("--transitionDuration", `${ms}ms`);
  }

  private createFieldsArr(): Field[][] {
    const el: Field[][] = [];
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      el[r] = [];
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        el[r][c] = new Field(new Pos(r, c), this.isInverted);
        this.fieldsHtml.append(el[r][c].html);
      }
    }
    return el;
  }

  private placePieces(pieces: ArrOfPieces2d): void {
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        this.placePieceInPos(
          new Pos(r, c),
          pieces[r][c],
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
          Boolean(pieces[r][c]?.html)
        );
      }
    }
  }

  public calcFieldPosByPx(leftPx: number, topPx: number): Pos { // pos values from 0 to 7 or -1 if not in board
    const boardBoundingRect = this.html.getBoundingClientRect();
    const posOnBoardLeft = leftPx - boardBoundingRect.left;
    const posOnBoardTop =  topPx - boardBoundingRect.top;
    const fieldC = Math.floor((posOnBoardLeft/boardBoundingRect.width)* FIELDS_IN_ONE_ROW);
    const fieldR = Math.floor((posOnBoardTop/boardBoundingRect.height)*FIELDS_IN_ONE_ROW);
    return new Pos(
      (fieldR >= 0 && fieldR <= FIELDS_IN_ONE_ROW-1) ? fieldR : POS_OUT_OF_BOARD, 
      (fieldC >= 0 && fieldC <= FIELDS_IN_ONE_ROW-1) ? fieldC : POS_OUT_OF_BOARD, 
    );
  }

  public placePieceInPos(
    pos: Pos, 
    piece: (AnyPiece|null), 
    cssPieceTransitionDelayMs: number, 
    appendHtml: boolean
  ): void {
    if (piece === null) {
      this.el[pos.y][pos.x].piece = null;
      return;
    }
    if (appendHtml) {
      this.piecesHtml.append(piece.html);
    }
    this.setPieceCssTransitionDeley(piece.html, cssPieceTransitionDelayMs);
    this.transformPieceHtmlToPos(piece.html, pos);
    setTimeout(() => this.setPieceCssTransitionDeley(piece.html, 0), cssPieceTransitionDelayMs);
    this.el[pos.y][pos.x].setPiece(piece);
  }

  private transformPieceHtmlToPos(pieceHtml: HTMLDivElement, pos: Pos): void {   
    pieceHtml.style.transform = 
      `translate(
        ${pos.x * 100}%,
        ${pos.y * 100}%
      )`;
  }

  private switchCurrTeam(): void {
    this.currTeam =
      (this.currTeam === TEAMS.WHITE) ? 
      TEAMS.BLACK : 
      TEAMS.WHITE;
  }

  private toggleCssGrabOnPieces() {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        this.el[r][c].piece?.toggleCssGrab();
      }
    }
  }

  public turnOfCssGrabOnPieces() {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        this.el[r][c].piece?.removeCssGrab();
      }
    }
  }

  public movePiece(from: Pos, to: Pos, piece: AnyPiece, transitionDelayMs: number): void {
    const capturedPiece =  this.el[to.y][to.x].piece;
    if (capturedPiece !== null) {
      this.removePieceInPos(to, true);
    }
    this.switchCurrTeam();
    this.placePieceInPos(to, piece, transitionDelayMs, false);
    piece.sideEffectsOfMove(to, from);
    const enemyKing = this.getKingByTeam(piece.enemyTeamNum);
    this.movesSystem.pushNewHalfmove(
      new Halfmove(
        piece, 
        from.getInvertedProperly(this.isInverted), 
        to.getInvertedProperly(this.isInverted), 
        capturedPiece, 
        (enemyKing.isInCheck()) ? enemyKing.pos : null,
        this.getRookIfKingCastled(piece, from, to)
      )
    );
    const afterMoveIsFinished = () => {
      this.match.checkIfGameShouldEndAfterMove(this.movesSystem.getLatestHalfmove());
      this.showNewMoveClassification(to);
      this.toggleCssGrabOnPieces();
      this.showCheckIfKingIsInCheck(piece.enemyTeamNum);
      this.showNewLastMove(from, to);
    }

    if (this.pawnPromotionMenu !== null) {
      this.pawnPromotionMenu.playerIsChoosing.then(afterMoveIsFinished);
    } else {
      afterMoveIsFinished();
    }
  }

  private getRookIfKingCastled(piece: AnyPiece, from: Pos, to: Pos): Rook|null {
    if (!Piece.isKing(piece) || Math.abs(from.x - to.x) < 2) {
      return null;
    }
    const castleXDir = (to.x - from.x > 0) ? 1 : -1;
    const currRookPos = new Pos(to.y, to.x - castleXDir);
    return this.el[currRookPos.y][currRookPos.x].piece as Rook;
  }

  public removePieceInPos(pos: Pos, removeHtml: boolean) {
    if (removeHtml) {
      this.el[pos.y][pos.x].piece?.html.remove();
    }
    this.el[pos.y][pos.x].setPiece(null);
  }

  public getKingByTeam(team: TEAMS) {
    return (
      (team === TEAMS.WHITE) ?
      this.kings.white : 
      this.kings.black
    );
  }

  public createKingsObj(pieces: ArrOfPieces2d): KingsObj|null {
    let kingWhite: null|King = null;
    let kingBlack: null|King = null;
    for (let r=0 ; r<pieces.length ; r++) {
      for (let c=0 ; c<pieces[r].length ; c++) {
        const piece = pieces[r][c];
        if (Piece.isKing(piece)) {
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
    return (
      (kingWhite === null || kingBlack === null) ?
      null :
      { white: kingWhite, black: kingBlack }
    );
  } 
  public getKingPosByTeam(team: TEAMS): Pos {
    return (
      (team === TEAMS.WHITE) ?
      this.kings.white.pos : 
      this.kings.black.pos
    );
  }

  public showFieldUnderMovingPiece(pos: Pos): void {
    this.stopShowingFieldUnderMovingPiece();
    if (!Board.isPosIn(pos)) {
      return;
    }
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldUnderMovingPiece)
    this.el[pos.y][pos.x].html.append(div);
  }

  public stopShowingFieldUnderMovingPiece() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldUnderMovingPiece}`);
  }

  public showFieldPieceWasSelectedFrom(pos: Pos): void {
    this.stopShowingFieldPieceWasSelectedFrom();
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldPieceWasSelectedFrom);
    this.el[pos.y][pos.x].html.append(div);
  }

  public stopShowingFieldPieceWasSelectedFrom() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldPieceWasSelectedFrom}`);
  }

  public showPossibleMoves(possMovesToShow: Pos[], enemyTeamNum: number, from: Pos): void {
    for (const possMove of possMovesToShow) {
      const div = document.createElement("div");
      const isMoveCapture = 
        (this.el[possMove.y][possMove.x].piece?.team === enemyTeamNum ||
         (Piece.isPawn(this.el[from.y][from.x].piece) && // en passant
          from.x !== possMove.x));
      div.classList.add(
        CLASS_NAMES_FIELD.possMove,
        (isMoveCapture) ? CLASS_NAMES_FIELD.possMoveCapture : CLASS_NAMES_FIELD.possMovePlain
      );

      this.el[possMove.y][possMove.x].html.append(div);
    }
  }

  public stopShowingPossibleMoves(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.possMove}`);

  }

  public stopShowingCheck() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldInCheck}`);
  }

  public showCheck(kingPos: Pos): void {// king pos as argument instead of this.pos because of the ability to go back in time and temporarly see what happened
    this.stopShowingCheck();
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldInCheck);
    this.el[kingPos.y][kingPos.x].html.append(div);
  }

  public showCheckIfKingIsInCheck(kingTeam: TEAMS): void {
    // field becomes red if in check
    const king = this.getKingByTeam(kingTeam);
    this.stopShowingCheck();
    if (king.isInCheck()) {
      this.showCheck(king.pos);
    }
  }

  public showNewMoveClassification(pos: Pos): void {
    this.stopShowingMoveClassification();
    const rand = Math.floor(Math.random()*20);
    switch (rand) { // both 5% chance
      case 0: this.showBrilliantMove(pos); break;
      case 1: this.showBlunderMove(pos); break;
    }
  }

  private showBrilliantMove(pos: Pos): void {
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldMoveClassification, CLASS_NAMES_FIELD.fieldBrilliant);
    this.el[pos.y][pos.x].html.append(div);
    this.moveClassification = new Pos(pos.y, pos.x);
  }

  private showBlunderMove(pos: Pos): void {
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldMoveClassification, CLASS_NAMES_FIELD.fieldBlunder);
    this.el[pos.y][pos.x].html.append(div);
    this.moveClassification = new Pos(pos.y, pos.x);
  }

  public stopShowingMoveClassification(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldBrilliant}`);
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldBlunder}`);
    this.moveClassification = null;
  }

  public showNewRowAndColUserIsTouching(touch: Pos): void {
    this.stopShowingRowAndColUserIsTouching();
    if (Board.isPosIn(touch)) {
      this.showRowAndColUserIsTouching(touch);
    }
  }

  public showRowAndColUserIsTouching(touch: Pos): void {
    const createHighlight = (): HTMLDivElement => {
      const highlight = document.createElement("div");
      highlight.classList.add(
        CLASS_NAMES_FIELD.fieldRowAndColHighlight,
      );
      return highlight;
    };
    for (let i=0 ; i<FIELDS_IN_ONE_ROW ; i++) {
      this.el[i][touch.x].html.append(createHighlight());
      this.el[touch.y][i].html.append(createHighlight());
    }
  }

  public stopShowingRowAndColUserIsTouching(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldRowAndColHighlight}`);
  }

  public showNewLastMove(from: Pos, to: Pos): void {
    this.stopShowingLastMove();
    this.showLastMove(from, to);
  }

  private showLastMove(from: Pos, to: Pos): void {
    const toShow = [from, to];
    for (const pos of toShow) {
      const lastMove = document.createElement("div");
      lastMove.classList.add(CLASS_NAMES_FIELD.fieldLastMove);
      this.el[pos.y][pos.x].html.append(lastMove);
    }
  }

  public stopShowingLastMove(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldLastMove}`);
  }

  private stopShowingHighlight(querySelectorAll: string): void {
    this.html.querySelectorAll(querySelectorAll).forEach(el => {
      el.remove();
    });
  }


  private invert(): void {
    this.isInverted = (this.isInverted) ? false : true;

    this.invertPieces();
    this.invertFields();
  }

  private invertPieces(): void {
    const boardBefore = this.createArrOfPieces();
    const boardAfter = this.invertMap(boardBefore);
    for (let r=0 ; r<boardAfter.length ; r++) {
      for (let c=0 ; c<boardAfter[r].length ; c++) {
        const piece = boardAfter[r][c];
        piece?.invert();
        this.placePieceInPos(new Pos(r, c), piece, CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, false);
      }
    }
  }

  private invertFields() {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        this.el[r][c].invertHtml(new Pos(r, c), this.isInverted);
      }
    }
    if (this.movesSystem.isThereAtLeastOneHalfMove()) {
      this.showCheckIfKingIsInCheck(
        this.movesSystem.getLatestHalfmove().piece.enemyTeamNum
      );
      if (!this.analisisSystem.isUserAnalisingMove0()) {
        const currHalfMove = this.movesSystem.halfmoves[this.analisisSystem.getIndexOfHalfmoveUserIsOn()];
        this.showNewLastMove(
          currHalfMove.from.getInvertedProperly(this.isInverted), 
          currHalfMove.to.getInvertedProperly(this.isInverted)
        );
      }
    }

    if (this.moveClassification !== null) {
      const div = document.querySelector(`.${CLASS_NAMES_FIELD.fieldMoveClassification}`) as HTMLDivElement;
      div.remove();
      this.moveClassification.invert();
      this.el[this.moveClassification.y][this.moveClassification.x].html.append(div);
    }
  }

  private createArrOfPieces(): ArrOfPieces2d {
    return this.el.map(row => row.map(field => field.piece));
  }

  private invertMap(map: ArrOfPieces2d): ArrOfPieces2d {
    return map.reverse().map(row => row.reverse());
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
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (
          this.el[r][c].isOccupied() && 
          !Piece.isKing(this.el[r][c].piece)
        ) {
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

  private isPositionKingAndSomePieceVsKing(pieceId: PIECES.BISHOP|PIECES.KNIGHT): boolean {
    let pieceOccurrencesCounter = 0;
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.id === pieceId) {
          if (pieceOccurrencesCounter > 0) {
            return false;
          }
          pieceOccurrencesCounter++;
          continue;
        }
        if (
          this.el[r][c].isOccupied() && 
          !Piece.isKing(this.el[r][c].piece)
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private isPositionKingAndBishopVsKingAndBishop(): boolean { // both bishops on squeres of the same color
    const bishops: Pos[] = [];
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (!this.el[r][c].isOccupied() || Piece.isKing(this.el[r][c].piece)) {
          continue;
        }
        const piece = this.el[r][c].piece as AnyPiece;
        if (!Piece.isBishop(piece)) {
          return false;
        }
        if (bishops.length >= 2) {
          return false;
        }
        bishops.push(new Pos(r, c));
      }
    }
    return this.isTwoEnemyBishopsOnTheSameColor(bishops);
  }

  private isTwoEnemyBishopsOnTheSameColor(bishopsPos: Pos[]): boolean {
    if (bishopsPos.length !== 2) {
      return false;
    }
    const bishop1 = this.el[bishopsPos[0].y][bishopsPos[0].x].piece as Piece;
    const bishop2 = this.el[bishopsPos[1].y][bishopsPos[1].x].piece as Piece;

    return (
      bishop1.team !== bishop2.team && 
      this.isPositionsOnTheSameColor(bishopsPos[0], bishopsPos[1])
    );
  }

  private isPositionsOnTheSameColor(pos1: Pos, pos2: Pos): boolean {
    const pos1OnWhiteSquere = 
      this.el[pos1.y][pos1.x].html.className.includes(CLASS_NAMES_FIELD.fieldColor1);
    const pos2OnWhiteSquere = 
      this.el[pos2.y][pos2.x].html.className.includes(CLASS_NAMES_FIELD.fieldColor1);

    return pos1OnWhiteSquere === pos2OnWhiteSquere;
  }

  public isDrawByNoCapturesOrPawnMovesIn50Moves(): boolean {
    const halfmoves = this.movesSystem.halfmoves;
    if (halfmoves.length < 50) {
      return false;
    }
    for (let i=halfmoves.length-1 ; i>halfmoves.length-1-50 ; i--) {
      if (
        halfmoves[i].capturedPiece !== null || 
        Piece.isPawn(halfmoves[i].piece)
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
    const lastMoveNum = halfmoves.length-1;
    const p1Moves = [halfmoves[lastMoveNum-4], halfmoves[lastMoveNum-2], halfmoves[lastMoveNum]];
    const p2Moves = [halfmoves[lastMoveNum-5], halfmoves[lastMoveNum-3], halfmoves[lastMoveNum-1]];

    return ( // trust, it works
      p1Moves[0].from.isEqualTo(p1Moves[1].to) && 
      p1Moves[1].from.isEqualTo(p1Moves[2].to) && 
      p2Moves[0].from.isEqualTo(p2Moves[1].to) && 
      p2Moves[1].from.isEqualTo(p2Moves[2].to) &&
      p1Moves[0].piece === p1Moves[2].piece && 
      p2Moves[0].piece === p2Moves[2].piece &&
      Piece.isArrContainingEqualPieces(
        p1Moves[0].capturedPiece, 
        p1Moves[1].capturedPiece, 
        p1Moves[2].capturedPiece
      ) && // true if all captures are null since every piece can only be captured once
      Piece.isArrContainingEqualPieces(
        p2Moves[0].capturedPiece, 
        p2Moves[1].capturedPiece, 
        p2Moves[2].capturedPiece
      ) // true if all captures are null since every piece can only be captured once
    );
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
    const fieldSize = this.html.getBoundingClientRect().width / FIELDS_IN_ONE_ROW;
    if (fieldSize !== Math.floor(fieldSize)) // field size has to be int - read the Board.positionHtmlProperly comment
    { 
      this.html.classList.remove(CLASS_NAMES.thisHtmlDefaultWidth);
      this.html.style.setProperty("--customWidth", `${Math.floor(fieldSize) * FIELDS_IN_ONE_ROW}px`);
    }
  }

  private setCssVariables(): void {
    const root = document.querySelector(":root") as HTMLElement;
    const fieldSize = this.html.offsetWidth / FIELDS_IN_ONE_ROW; // field size will allways be int thanks to Board.resizeHtml function
    root.style.setProperty("--pieceSize", `${fieldSize}px`);
    root.style.setProperty("--pieceMoveTouchSize", `${fieldSize * 2}px`);
    root.style.setProperty("--fieldLabelFontSize", `${fieldSize*0.35}px`);
  }

  private positionAllPiecesHtmlsProperly(): void {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        if (this.el[r][c].isOccupied()) {
          this.transformPieceHtmlToPos((this.el[r][c].piece as AnyPiece).html, new Pos(r, c));
        }
      }
    }
  }

  public createNewPieceObj(id: (PIECES|null), team: (TEAMS|null), board: Board)
  : (AnyPiece | null) {
    if (id === null || team === null) {
      return null;
    }

    switch (id) {
      case PIECES.PAWN:   return new Pawn  (team, board);
      case PIECES.ROOK:   return new Rook  (team, board);
      case PIECES.KNIGHT: return new Knight(team, board);
      case PIECES.BISHOP: return new Bishop(team, board);
      case PIECES.QUEEN:  return new Queen (team, board);
      case PIECES.KING:   return new King  (team, board);
      default:            return null;
    }
  }

  public findPosOfPiece(piece: AnyPiece|Piece): Pos|null {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        if (this.el[r][c].piece === piece) {
          return new Pos(r, c);
        }
      }
    }
    return null;
  }

  get startQueenPosWhite(): Pos {
    const queenDefaultXPos = 3;
    const startYPos = FIELDS_IN_ONE_ROW-1;
    return new Pos(startYPos, queenDefaultXPos, this.isInverted); 
  }

  get startKingPosWhite(): Pos {
    const kingDefaultXPos = 4;
    const startYPos = FIELDS_IN_ONE_ROW-1;
    return new Pos(startYPos, kingDefaultXPos, this.isInverted);
  }

  get startQueenPosBlack(): Pos {
    const queenDefaultXPos = 3;
    const startYPos = 0;
    return new Pos(startYPos, queenDefaultXPos, this.isInverted); 
  }

  get startKingPosBlack(): Pos {
    const kingDefaultXPos = 4;
    const startYPos = 0;
    return new Pos(startYPos, kingDefaultXPos, this.isInverted); 
  }

  public static isPosIn(pos: Pos): boolean {
    return (
      pos.x >= 0 && pos.x <= FIELDS_IN_ONE_ROW-1 && 
      pos.y >= 0 && pos.y <= FIELDS_IN_ONE_ROW-1
    );
  }
}