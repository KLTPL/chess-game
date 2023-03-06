import Board, { hold } from "../board-components/Board.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import King from "./King.js";
import Check from "../Check.js";
import Pawn from "./Pawn.js";
import Rook from "./Rook.js";
import Knight from "./Knight.js";
import Bishop from "./Bishop.js";
import Queen from "./Queen.js";

export type AnyPiece = (Pawn|Rook|Knight|Bishop|Queen|King);

export type SelectedPieceInfo = {
  piece: (AnyPiece|Piece);
  grabbedFrom: Pos;
};

export const enum PIECES {
  PAWN,
  ROOK,
  KNIGHT,
  BISHOP,
  QUEEN,
  KING,
};

export const enum TEAMS {
  WHITE,
  BLACK,
};

export type Pin = {
  pinnedPiecePos: Pos;
  pinDir: Dir;
};

const PIECE_GRAB_CLASS_NAME = "grab";
const ID_SELECTED_PIECE_MOUSE = "move-mouse";
const ID_SELECTED_PIECE_TOUCH = "move-touch";
export const HOLD_MOUSE_TIME_MS = 150;
const HOLD_TOUCH_TIME_MS = 125;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT = 30;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE = 0;

export default abstract class Piece {
  public abstract value: number;
  public abstract id: PIECES;
  public html: HTMLDivElement;
  constructor(readonly team: TEAMS, protected board: Board) {
    this.html = this.createNewHtmlPiece();
    if (this.board.currTeam === this.team) {
      this.html.classList.add(PIECE_GRAB_CLASS_NAME);
    }
    this.startListeningForClicks();
  }
  
  public abstract createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[];

  public abstract createArrOfPossibleMovesFromPos(pos: Pos): Pos[];

  public sideEffectsOfMove(to: Pos, from: Pos): void {to; from;};

  public invert(): void {};

  public toggleCssGrab() {
    this.html.classList.toggle(PIECE_GRAB_CLASS_NAME);
  }

  public removeCssGrab() {
    this.html.classList.remove(PIECE_GRAB_CLASS_NAME);
  }

  private startListeningForClicks(): void {
    this.html.addEventListener(
      "mousedown",
      this.startFollowingCursorMouse
    );
    this.html.addEventListener(
      "touchstart",
      this.startFollowingCursorTouch
    )
  }

  public stopListeningForClicks(): void {
    this.html.removeEventListener(
      "mousedown",
      this.startFollowingCursorMouse
    );
  }

  private createNewHtmlPiece(): HTMLDivElement {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    return piece;
  }

  protected addClassName(pieceNum: number): void {
    const specificClassName = Piece.getClassNameByPiece(pieceNum, this.team);
    if (specificClassName !== null) {
      this.html.classList.add(specificClassName);
    }
  }

   private startFollowingCursorMouse = (ev: MouseEvent): void => { // TODO
    const leftClickNum = 0;
    const fieldCoor = this.board.findPosOfPiece(this);
    if( 
      ev.button !== leftClickNum || 
      !this.board.match.isGameRunning || 
      this.board.currTeam !== this.team ||
      this.board.pawnPromotionMenu !== null || 
      this.board.selectedPieceInfo !== null || 
      this.board.analisisSystem.isUserAnalising() ||
      fieldCoor === null
    ) {
      return;
    }
    const possMoves = this.createArrOfPossibleMovesFromPos(fieldCoor);
    this.board.showEventsOnBoard.showFieldPieceWasSelectedFrom(fieldCoor);
    this.board.showEventsOnBoard.showPossibleMoves(possMoves.filter(move => !move.isEqualTo(fieldCoor)), this.enemyTeamNum, fieldCoor);
    this.board.selectedPieceInfo = { piece: this, grabbedFrom: fieldCoor }; // TODO this Piece | AnyPiece
    this.board.removePieceInPos(fieldCoor, false);
    this.html.id = ID_SELECTED_PIECE_MOUSE;
    this.moveToPointer(ev.clientX, ev.clientY);
    document.addEventListener(
      "mousemove",
      this.handleMouseMove
    );

    hold(this.html, "mouseup", HOLD_MOUSE_TIME_MS)
      .then(() => {
        document.addEventListener(
          "mouseup",
          newEv => this.stopFollowingCursorMouse(newEv, possMoves), 
          { once: true }
        );
      })
      .catch(() => {
        document.addEventListener(
          "mousedown", 
          newEv => this.stopFollowingCursorMouse(newEv, possMoves), 
          { once: true }
        )
      });
  }

  private handleMouseMove = (ev: MouseEvent): void => {
    this.moveToPointer(ev.clientX, ev.clientY);
  }

  private hanldeTouchMove = (ev: TouchEvent): void => {
    this.board.showEventsOnBoard.showNewRowAndColUserIsTouching(
      this.board.calcFieldPosByPx(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY)
    );
    this.moveToPointer(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
  }

  private startFollowingCursorTouch = (ev: TouchEvent): void => {
    ev.preventDefault(); // prevents this.startFollowingCursorMouse from executing
    const touch = ev.changedTouches[0];
    const fieldCoor = this.board.findPosOfPiece(this);
    if( 
      !this.board.match.isGameRunning || 
      this.board.currTeam !== this.team ||
      this.board.pawnPromotionMenu !== null || 
      this.board.selectedPieceInfo !== null || 
      this.board.analisisSystem.isUserAnalising() ||
      touch.identifier > 0 ||
      fieldCoor === null
    ) {
      return;
    }
    const possMoves = this.createArrOfPossibleMovesFromPos(fieldCoor);
    this.board.removePieceInPos(fieldCoor, false);
    this.board.selectedPieceInfo = { piece: this, grabbedFrom: fieldCoor }; // TODO this Piece | AnyPiece
    this.board.showEventsOnBoard.showFieldPieceWasSelectedFrom(fieldCoor);
    this.board.showEventsOnBoard.showPossibleMoves(possMoves.filter(move => !move.isEqualTo(fieldCoor)), this.enemyTeamNum, fieldCoor);

    hold(this.html, "touchend", HOLD_TOUCH_TIME_MS)
      .then(() => {
        this.board.removePieceInPos(fieldCoor, false);
        this.html.id = ID_SELECTED_PIECE_TOUCH;
        this.board.showEventsOnBoard.showRowAndColUserIsTouching(fieldCoor);

        this.moveToPointer(touch.clientX, touch.clientY);
        this.html.addEventListener("touchmove", this.hanldeTouchMove);
        document.addEventListener(
          "touchend",
          newEv => this.stopFollowingCursorTouch(newEv, possMoves), 
          { once: true }
        );
      })
      .catch(() => {
        document.addEventListener(
          "touchstart", 
          newEv => this.stopFollowingCursorTouch(newEv, possMoves), 
          { once: true }
        )
      });
  }

  private moveToPointer = (clientX: number, clientY: number): void => {
    const coor = this.board.calcFieldPosByPx(clientX, clientY);
    this.board.showEventsOnBoard.showFieldUnderMovingPiece(coor);

    const trans = this.html.style.transform; // format: 'transform(Xpx, Ypx)'
    const oldTranslateX = trans.slice(
      trans.indexOf("(")+1, trans.indexOf(",")
    );
    const oldTranslateY = trans.slice(
      trans.indexOf(",")+1, trans.length-1
    );

    const newTranslateX = `${this.calcNewTranslateXValue(clientX)}px`;
    const newTranslateY = `${this.calcNewTranslateYValue(clientY)}px`;

    const translateX = (coor.x === -1) ? oldTranslateX : newTranslateX;
    const translateY = (coor.y === -1) ? oldTranslateY : newTranslateY;
    this.html.style.transform = `translate(${translateX}, ${translateY})`;
  }

  private calcNewTranslateXValue(clientX: number): number {
    return (
      clientX -
      (this.board.pageContainerHtml.offsetWidth - this.board.piecesHtml.offsetWidth)/2 -
      this.html.offsetWidth/2
    );
  }

  private calcNewTranslateYValue(clientY: number): number {
    return (
      clientY -
      (this.board.pageContainerHtml.offsetHeight - this.board.piecesHtml.offsetHeight)/2 -
      this.html.offsetWidth/2
    );
  }

  private stopFollowingCursorMouse = (ev: MouseEvent, possMoves: Pos[]): void => {
    const type = ev.type as "mouseup"|"mousedown";
    if (ev.button !== 0) { // 0 = left click
      document.addEventListener(
        type, 
        newEv => this.stopFollowingCursorMouse(newEv, possMoves), 
        { once: true }
      )
      return;
    }

    const boardGrabbedPieceInfo = this.board.selectedPieceInfo as SelectedPieceInfo; // .piece is equal to this
    document.removeEventListener(
      "mousemove", 
      this.handleMouseMove
    );
    this.html.id = ""; // remove the ID_SELECTED_PIECE_MOUSE
    this.board.showEventsOnBoard.stopShowingFieldPieceWasSelectedFrom();
    this.board.showEventsOnBoard.stopShowingFieldUnderMovingPiece();
    this.board.showEventsOnBoard.stopShowingPossibleMoves();
    const newPos = this.board.calcFieldPosByPx(ev.clientX, ev.clientY);
    const oldPos = boardGrabbedPieceInfo.grabbedFrom;
    for (const possMove of possMoves) {
      if ( 
        possMove.isEqualTo(newPos) &&
        !newPos.isEqualTo(oldPos)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          boardGrabbedPieceInfo.piece as AnyPiece,
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
        );
        this.board.selectedPieceInfo = null;
        return;
      }
    }
    this.board.placePieceInPos(
      oldPos, 
      boardGrabbedPieceInfo.piece as AnyPiece,
      this.calcTransitionDelay(oldPos, newPos),
      false
    );
    this.board.selectedPieceInfo = null;
  }

  private stopFollowingCursorTouch = (ev: TouchEvent, possMoves: Pos[]): void => {
    const touch = ev.changedTouches[0];
    const selectedPieceInfo = this.board.selectedPieceInfo as SelectedPieceInfo; // .piece is equal to this
    this.html.id = ""; // remove the ID_SELECTED_PIECE_TOUCH
    this.html.removeEventListener(
      "touchmove", 
      this.hanldeTouchMove
    );
    this.board.showEventsOnBoard.stopShowingFieldPieceWasSelectedFrom();
    this.board.showEventsOnBoard.stopShowingFieldUnderMovingPiece();
    this.board.showEventsOnBoard.stopShowingPossibleMoves();
    this.board.showEventsOnBoard.stopShowingRowAndColUserIsTouching();
    const newPos = this.board.calcFieldPosByPx(touch.clientX, touch.clientY);
    const oldPos = selectedPieceInfo.grabbedFrom;
    for (const possMove of possMoves) {
      if ( 
        possMove.isEqualTo(newPos) &&
        !newPos.isEqualTo(oldPos)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          selectedPieceInfo.piece as AnyPiece,
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
        );
        this.board.selectedPieceInfo = null;
        return;
      }
    }
    this.board.placePieceInPos(
      oldPos, 
      selectedPieceInfo.piece as AnyPiece,
      this.calcTransitionDelay(oldPos, newPos),
      false
    );
    this.board.selectedPieceInfo = null;
  }

  private calcTransitionDelay(oldPos: Pos, newPos: Pos): number {
    const distanceX = Math.abs(newPos.x - oldPos.x);
    const distanceY = Math.abs(newPos.y - oldPos.y);
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    return distance * CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT*0.666;
  }

  protected substractAbsPinsFromPossMoves(possMoves: Pos[], absPins: Pin[], pos: Pos): Pos[] {
    for (const pin of absPins) {
      if (pin.pinnedPiecePos.isEqualTo(pos)) {
        possMoves = possMoves.filter(move => {
          const simplifyXAndY = 
            (Piece.isKnight(this.board.el[pos.y][pos.x].piece)) ? 
            false : 
            true; // simplify means make 1 if >1 and -1 if <-1
          const moveDir = new Dir(move.y-pos.y, move.x-pos.x, simplifyXAndY);
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

  protected removePossMovesIfKingIsInCheck(possMoves: Pos[], myKing: King, pos: Pos): Pos[] {
    const checks = myKing.createArrOfChecks();
    if (checks.length === 0) {
      return possMoves;
    }
    if (checks.length === 2) {
      return [];
    }
    return possMoves.filter(possMove => {
      return (
        !possMove.isEqualTo(pos) &&
        this.isMoveCaptureOrOnTheWayOfCheck(checks[0], possMove) //myKing.checks[0] is the only check
      );
    });
  }

  private isMoveCaptureOrOnTheWayOfCheck(check: Check, move: Pos): boolean {
    const isCapture = (
      check.checkingPiecePos.x === move.x && 
      check.checkingPiecePos.y === move.y
    );
    let isOnTheLine = false;
    for (const field of check.createArrOfFieldsInBetweenPieceAndKing()) {
      if (move.isEqualTo(field)) {
        isOnTheLine = true;
      }
    }
    return isCapture || isOnTheLine;
  }

  public get enemyTeamNum(): TEAMS.BLACK|TEAMS.WHITE {
    return (
      (this.team === TEAMS.WHITE) ? 
      TEAMS.BLACK : 
      TEAMS.WHITE
    );
  }

  public static getClassNameByPiece(pieceNum: number, pieceTeam: TEAMS): (string|null) {
    const teamChar = (pieceTeam === TEAMS.BLACK) ? "b" : "w";
    const name = (() => {
      switch (pieceNum) {
        case PIECES.KING:   return "king";
        case PIECES.QUEEN:  return "queen";
        case PIECES.BISHOP: return "bishop";
        case PIECES.KNIGHT: return "knight";
        case PIECES.ROOK:   return "rook";
        case PIECES.PAWN:   return "pawn";
        default: return null;
      }
    }) ();
    if (name === null) {
      console.error("Invalid piece number");
      return null;
    }
    return `${teamChar}-${name}`;
  }

  public static isArrContainingEqualPieces(...pieces: (Piece | null)[]): boolean {
    if (pieces.length === 0) {
      console.error("Not enough captures to compare");
      return false;
    }
    const firstCapture = pieces[0];
    for (let i=1 ; i<pieces.length ; i++) {
      if (firstCapture !== pieces[i]) {
        return false;
      }
    }
    return true;
  }

  public static isKing(piece: AnyPiece|null): piece is King {
    return piece?.id === PIECES.KING;
  }

  public static isPawn(piece: AnyPiece|null): piece is Pawn {
    return piece?.id === PIECES.PAWN;
  }

  public static isBishop(piece: AnyPiece|null): piece is Bishop {
    return piece?.id === PIECES.BISHOP;
  }

  public static isKnight(piece: AnyPiece|null): piece is Knight {
    return piece?.id === PIECES.KNIGHT;
  }

  public static isQueen(piece: AnyPiece|null): piece is Queen {
    return piece?.id === PIECES.QUEEN;
  }

  public static isRook(piece: AnyPiece|null): piece is Rook {
    return piece?.id === PIECES.ROOK;
  }
}