import Board, { HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE } from "../Board.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import King from "./King.js";
import Check from "../Check.js";
import GrabbedPieceInfo from "./GrabbedPieceInfo.js";

export enum PIECES {
  PAWN,
  ROOK,
  KNIGHT,
  BISHOP,
  QUEEN,
  KING,
};

export enum TEAMS {
  WHITE,
  BLACK,
};

export const DEFAULT_TRANSITION_DELAY_MS = 30;

export default class Piece {
  value: number;
  id: number;
  team: number;
  html: HTMLElement;
  board: Board;
  constructor(team: number, board: Board) {
    this.value = 0;
    this.team = team;
    this.html = this.createNewHtmlPiece();
    this.board = board;
    this.id = 0;
    this.html.addEventListener(
      "mousedown",
      this.startFollowingCursor,
      {once: true}
    );
  }

  createNewHtmlPiece() {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    return piece;
  }

  addClassName(pieceNum: number) {
    const specificClassName = Piece.getClassNameByPiece(pieceNum, this.team);
    if (specificClassName !== null) {
      this.html.classList.add(specificClassName);
    }
  }

  enemyTeamNum() {
    return (
      (this.team === TEAMS.WHITE) ? 
      TEAMS.BLACK : 
      TEAMS.WHITE
    );
  }

  getPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    pos
    return [];
  }

  getPossibleMovesFromPos(pos: Pos): Pos[] {
    pos
    return [];
  }

  startFollowingCursor = (ev: MouseEvent) => {
    const leftClickNum = 0;
    const fieldCoor = this.board.calcFieldCoorByPx(ev.clientX, ev.clientY);
    const possMoves = this.getPossibleMovesFromPos(fieldCoor);
    if( 
      this.board.currTeam !== this.team || 
      ev.button !== leftClickNum || 
      this.board.pawnPromotionMenu !== null || 
      this.board.grabbedPieceInfo !== null || 
      !this.board.match.gameRunning 
    ) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
      return;
    }
    this.board.showPossibleMoves(possMoves, this.enemyTeamNum());
    this.board.grabbedPieceInfo = new GrabbedPieceInfo(this, fieldCoor);
    this.board.removePieceInPos(fieldCoor, false);
    this.html.id = "move";
    this.moveToCursor(ev);
    document.addEventListener(
      "mousemove",
      this.moveToCursor
    );

    this.mouseHold()
      .then(() => {
        document.addEventListener(
          "mouseup",
          newEv => this.stopFollowingCursor(newEv, possMoves), 
          {once: true}
        );
      })
      .catch(() => {
        document.addEventListener(
          "mousedown", 
          newEv => this.stopFollowingCursor(newEv, possMoves), 
          {once: true}
        )
      });
  }

  moveToCursor = (ev: MouseEvent) => {
    ev.preventDefault();
    this.board.highlightFieldUnderMovingPiece(this.board.calcFieldCoorByPx(ev.clientX, ev.clientY));

    const trans = this.html.style.transform; // format: 'transform(Xpx, Ypx)'
    const oldTranslateX = trans.slice(
      trans.indexOf("(")+1, trans.indexOf(",")
    );
    const oldTranslateY = trans.slice(
      trans.indexOf(",")+1, trans.length-1
    );

    const newTranslateX = `${this.calcNewTranslateXValue(ev.clientX)}px`;
    const newTranslateY = `${this.calcNewTranslateYValue(ev.clientY)}px`;
    const coor = this.board.calcFieldCoorByPx(ev.clientX, ev.clientY);

    const translateX = (coor.x === -1) ? oldTranslateX : newTranslateX;
    const translateY = (coor.y === -1) ? oldTranslateY : newTranslateY;
    this.html.style.transform = `translate(${translateX}, ${translateY})`;
  }

  calcNewTranslateXValue(clientX: number) {
    return (
      clientX -
      (this.board.pageContainerHtml.offsetWidth - this.board.piecesHtml.offsetWidth) /
      2 -
      this.html.offsetWidth/2
    );
  }

  calcNewTranslateYValue(clientY: number) {
    return (
      clientY -
      (this.board.pageContainerHtml.offsetHeight - this.board.piecesHtml.offsetHeight) /
      2 -
      this.html.offsetWidth/2
    );
  }

  stopFollowingCursor = (ev: MouseEvent, possMoves: Pos[]) => {
    const boardGrabbedPieceInfo = this.board.grabbedPieceInfo as GrabbedPieceInfo;
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
    const newPos = this.board.calcFieldCoorByPx(ev.clientX, ev.clientY);
    const oldPos = boardGrabbedPieceInfo.grabbedFrom;
    for (let i=0 ; i<possMoves.length ; i++) {
      if ( 
        possMoves[i].isEqualTo(newPos) &&
        (newPos.x !== oldPos.x || 
         newPos.y !== oldPos.y)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          boardGrabbedPieceInfo.piece,
          DEFAULT_TRANSITION_DELAY_MS
        );
        possMoves = [];
        this.board.grabbedPieceInfo = null;
        return;
      }
    }
    this.board.placePieceInPos(
      oldPos, 
      boardGrabbedPieceInfo.piece,
      this.calcTransitionDelay(oldPos, newPos)
    );
    this.board.grabbedPieceInfo = null;
  }

  calcTransitionDelay(oldPos: Pos, newPos: Pos) {
    const distanceX = Math.abs(newPos.x - oldPos.x);
    const distanceY = Math.abs(newPos.y - oldPos.y);
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    return distance * 25;
  }

  substractAbsPinsFromPossMoves(possMoves: Pos[], absPins: Pin[], pos: Pos) {
    for (const pin of absPins) {
      if (pin.pinnedPiecePos.isEqualTo(pos)) {
        possMoves = possMoves.filter(move => {
          const simplifyXAndY = (this.id === PIECES.KNIGHT) ? false : true; // simplify means make 1 if >1 and -1 if <-1
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

  mouseHold() {
    return new Promise<void>((resolve, reject) => {
      this.html.addEventListener(
        "mouseup", () => {
          reject();
        },
        {once: true}
      );
      setTimeout(() => {
        resolve();
      }, 150);
    })
  }

  removePossMovesIfKingIsInCheck(possMoves: Pos[], myKing: King, pos: Pos ) {
    if (myKing.checks.length === 0) {
      return possMoves;
    }
    if (myKing.checks.length === 2) {
      return [];
    }
    // myKing.checks.length === 1
    for (let m=0 ; m<possMoves.length ; m++) {
      if (possMoves[m].x === pos.x && possMoves[m].y === pos.y) {
        continue;
      }

      for (let c=0 ; c<myKing.checks.length ; c++) {
        if (!this.moveIsCaptureOrIsOnTheWayOfACheck(myKing.checks[c], possMoves[m])) {
          possMoves.splice(m, 1);
          m--;
        }
      }
    } 
    return possMoves;
  }

  moveIsCaptureOrIsOnTheWayOfACheck(check: Check, move: Pos) {
    const isCapture = (
      check.checkingPiecePos.x === move.x && 
      check.checkingPiecePos.y === move.y
    );
    let isOnTheLine = false;
    for (const field of check.fieldsInBetweenPieceAndKing) {
      if (move.isEqualTo(field)) {
        isOnTheLine = true;
      }
    }
    return isCapture || isOnTheLine;
  }

  sideEffectsOfMove(to: Pos, from: Pos) {to; from}

  static getPieceNumByName(name: string): (number|null) {
    switch (name) {
      case "pawn":   return PIECES.PAWN;
      case "rook":   return PIECES.ROOK;
      case "knight": return PIECES.KNIGHT;
      case "bishop": return PIECES.BISHOP;
      case "queen":  return PIECES.QUEEN;
      case "king":   return PIECES.KING;
      default:       return null;
    }
  }

  static getClassNameByPiece(pieceNum: number, pieceTeam: number) {
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

  static createPromoteOptionHtml(piece: number, team: number) {
    const option = document.createElement("div");
    option.classList.add("promote-option");

    const specificClassName = Piece.getClassNameByPiece(piece, team);
    if (specificClassName !== null) {
      option.classList.add(specificClassName);
    }
    return option;
  }
}