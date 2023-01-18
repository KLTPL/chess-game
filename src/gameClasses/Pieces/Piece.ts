import { mouseHold } from "../../app.js";
import Board, { HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE } from "../Board.js";
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

export type GrabbedPieceInfo = {
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

export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT = 30;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE = 0;

export default abstract class Piece {
  public abstract value: number;
  public abstract id: PIECES;
  public html: HTMLDivElement;
  constructor(readonly team: TEAMS, protected board: Board) {
    this.html = this.createNewHtmlPiece();
    this.startListeningForClicks();
  }
  
  public abstract createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[];

  public abstract createArrOfPossibleMovesFromPos(pos: Pos): Pos[];

  public sideEffectsOfMove(to: Pos, from: Pos): void {to; from;};

  private startListeningForClicks(): void {
    this.html.addEventListener(
      "mousedown",
      this.startFollowingCursor
    );
  }

  public stopListeningForClicks(): void {
    this.html.removeEventListener(
      "mousedown",
      this.startFollowingCursor
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

  private startFollowingCursor = (ev: MouseEvent): void => { // TODO
    const leftClickNum = 0;
    if( 
      ev.button !== leftClickNum || 
      !this.board.match.isGameRunning || 
      this.board.currTeam !== this.team ||
      this.board.pawnPromotionMenu !== null || 
      this.board.grabbedPieceInfo !== null || 
      this.board.analisisSystem.isUserAnalising()
    ) {
      return;
    }

    const fieldCoor = this.board.calcFieldPosByPx(ev.clientX, ev.clientY, true);
    const possMoves = this.createArrOfPossibleMovesFromPos(fieldCoor);
    this.board.showPossibleMoves(possMoves, this.enemyTeamNum);
    this.board.grabbedPieceInfo = { piece: this, grabbedFrom: fieldCoor }; // TODO this Piece | AnyPiece
    this.board.removePieceInPos(fieldCoor, false);
    this.html.id = "move";
    this.moveToCursor(ev);
    document.addEventListener(
      "mousemove",
      this.moveToCursor
    );

      mouseHold(this.html)
      .then(() => {
        document.addEventListener(
          "mouseup",
          newEv => this.stopFollowingCursor(newEv, possMoves), 
          { once: true }
        );
      })
      .catch(() => {
        document.addEventListener(
          "mousedown", 
          newEv => this.stopFollowingCursor(newEv, possMoves), 
          { once: true }
        )
      });
  }

  private moveToCursor = (ev: MouseEvent): void => {
    ev.preventDefault();
    const coor = this.board.calcFieldPosByPx(ev.clientX, ev.clientY);
    this.board.highlightFieldUnderMovingPiece(coor);

    const trans = this.html.style.transform; // format: 'transform(Xpx, Ypx)'
    const oldTranslateX = trans.slice(
      trans.indexOf("(")+1, trans.indexOf(",")
    );
    const oldTranslateY = trans.slice(
      trans.indexOf(",")+1, trans.length-1
    );

    const newTranslateX = `${this.calcNewTranslateXValue(ev.clientX)}px`;
    const newTranslateY = `${this.calcNewTranslateYValue(ev.clientY)}px`;

    const translateX = (coor.x === -1) ? oldTranslateX : newTranslateX;
    const translateY = (coor.y === -1) ? oldTranslateY : newTranslateY;
    this.html.style.transform = `translate(${translateX}, ${translateY})`;
  }

  private calcNewTranslateXValue(clientX: number): number {
    return (
      clientX -
      (this.board.pageContainerHtml.offsetWidth - this.board.piecesHtml.offsetWidth) /
      2 -
      this.html.offsetWidth/2
    );
  }

  private calcNewTranslateYValue(clientY: number): number {
    return (
      clientY -
      (this.board.pageContainerHtml.offsetHeight - this.board.piecesHtml.offsetHeight) /
      2 -
      this.html.offsetWidth/2
    );
  }

  private stopFollowingCursor = (ev: MouseEvent, possMoves: Pos[]): void => {
    const type = ev.type as "mouseup"|"mousedown";
    if (ev.button !== 0) { // 0 = left click
      document.addEventListener(
        type, 
        newEv => this.stopFollowingCursor(newEv, possMoves), 
        { once: true }
      )
      return;
    }

    const boardGrabbedPieceInfo = this.board.grabbedPieceInfo as GrabbedPieceInfo; // .piece is equal to this
    this.html.id = "";
    const id = HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE;
    if (document.getElementById(id)) {
      (document.getElementById(id) as HTMLElement).id = "";
    }
    document.removeEventListener(
      "mousemove", 
      this.moveToCursor
    );
    this.board.hidePossibleMoves();
    const newPos = this.board.calcFieldPosByPx(ev.clientX, ev.clientY);
    const oldPos = boardGrabbedPieceInfo.grabbedFrom;
    for (let i=0 ; i<possMoves.length ; i++) {
      if ( 
        possMoves[i].isEqualTo(newPos) &&
        !newPos.isEqualTo(oldPos)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          boardGrabbedPieceInfo.piece as AnyPiece,
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
        );
        possMoves = [];
        this.board.grabbedPieceInfo = null;
        return;
      }
    }
    this.board.placePieceInPos(
      oldPos, 
      boardGrabbedPieceInfo.piece as AnyPiece,
      this.calcTransitionDelay(oldPos, newPos),
      false
    );
    this.board.grabbedPieceInfo = null;
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

  public static createPromoteOptionHtml(piece: number, team: TEAMS): HTMLDivElement {
    const option = document.createElement("div");
    option.classList.add("promote-option");

    const specificClassName = Piece.getClassNameByPiece(piece, team);
    if (specificClassName !== null) {
      option.classList.add(specificClassName);
    }
    return option;
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