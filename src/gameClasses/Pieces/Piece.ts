import Board from "../Board.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import King from "./King.js";
import Check from "../Check.js";
import GrabbedPieceInfo from "./GrabbedPieceInfo.js";

export const PIECES = {
  pawn: 1,
  rook: 2,
  knight: 3,
  bishop: 4,
  queen: 5,
  king: 6,
};

export const TEAMS = {
  white: 1,
  black: 2
};

export default class Piece {
  value: number;
  num: number;
  team: number;
  html: HTMLElement;
  board: Board;
  possMoves: Pos[];
  defaultTransitionDelay: number;
  constructor(team: number, board: Board) {
    this.value = 0;
    this.team = team;
    this.html = this.createNewHtmlPiece();
    this.board = board;
    this.num = 0;
    this.possMoves = [];
    this.defaultTransitionDelay = 30;
    if (this.html !== null) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
    }
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
      (this.team === TEAMS.white) ? 
      TEAMS.black : 
      TEAMS.white
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
    const thisHtml = this.html as HTMLElement;
    const leftClickNum = 0;
    const fieldCoor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    if( 
      this.board.currTeam !== this.team || 
      ev.button !== leftClickNum || 
      this.board.pawnPromotionMenu !== null || 
      this.board.grabbedPieceInfo !== null || 
      !this.board.match.gameRunning 
    ) {
      thisHtml.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
      return;
    }
    this.possMoves = this.getPossibleMovesFromPos(fieldCoor);
    this.board.showPossibleMoves(this.possMoves, this.enemyTeamNum());
    let mouseHold = new Promise<void>((resolve, reject) => {
      thisHtml.addEventListener(
        "mouseup", () => {
          reject();
        }, 
        {once: true}
      );
      setTimeout(() => {
        resolve();
      }, 150);
    });

    this.board.grabbedPieceInfo = new GrabbedPieceInfo(this, fieldCoor);
    this.board.removePieceInPos(fieldCoor);
    thisHtml.id = "move";
    this.moveToCursor(ev);
    document.addEventListener(
      "mousemove",
      this.moveToCursor
    );

    mouseHold.then(() => {
      setTimeout(() => {
        document.addEventListener(
          "mouseup", 
          this.stopFollowingCursor, 
          {once: true}
        );
      })
    }).catch(() => {
      setTimeout(() => {
        document.addEventListener(
          "mousedown", 
          this.stopFollowingCursor, 
          {once: true}
        )
      });
    });

  }

  moveToCursor = (ev: MouseEvent) => {
    ev.preventDefault();
    const thisHtml = this.html as HTMLElement;
    this.board.highlightFieldUnderMovingPiece(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));

    const trans = thisHtml.style.transform;
    const oldTranslateX = trans.slice(
      trans.indexOf("(")+1, trans.indexOf(",")
    );
    const oldTranslateY = trans.slice(
      trans.indexOf(",")+1, trans.length-1
    );

    const newTranslateX = `${this.calcNewTranslateXValue(ev)}px`;
    const newTranslateY = `${this.calcNewTranslateYValue(ev)}px`;
    const coor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);

    const translateX = (coor.x === -1) ? oldTranslateX : newTranslateX;
    const translateY = (coor.y === -1) ? oldTranslateY : newTranslateY;
    thisHtml.style.transform = `translate(${translateX}, ${translateY})`;
  }

  calcNewTranslateXValue(ev: MouseEvent) {
    return (
      ev.clientX -
      (this.board.pageContainerHtml.offsetWidth - this.board.piecesHtml.offsetWidth) /
      2 -
      (this.html as HTMLDivElement).offsetWidth/2
    );
  }

  calcNewTranslateYValue(ev: MouseEvent) {
    return (
      ev.clientY -
      (this.board.pageContainerHtml.offsetHeight - this.board.piecesHtml.offsetHeight) /
      2 -
      (this.html as HTMLDivElement).offsetWidth/2
    );
  }

  stopFollowingCursor = (ev: MouseEvent) => {
    const thisHtml = this.html as HTMLElement;
    const boardGrabbedPieceInfo = this.board.grabbedPieceInfo as GrabbedPieceInfo;
    thisHtml.id = "";
    if (document.getElementById(this.board.highlightedFieldIdUnderGrabbedPieceId)) {
      (document.getElementById(this.board.highlightedFieldIdUnderGrabbedPieceId) as HTMLElement).id = "";
    }
    document.removeEventListener(
      "mousemove", 
      this.moveToCursor
    );
    this.board.hidePossibleMoves();
    const newPos = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    const oldPos = boardGrabbedPieceInfo.grabbedFrom;
    for (let i=0 ; i<this.possMoves.length ; i++) {
      if ( 
        this.possMoves[i].isEqualTo(newPos) &&
        (newPos.x !== oldPos.x || 
         newPos.y !== oldPos.y)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          boardGrabbedPieceInfo.piece,
          this.defaultTransitionDelay
        );
        this.possMoves = [];
        this.board.grabbedPieceInfo = null;
        return;
      }
    }
    this.board.placePieceInPos(
      oldPos, 
      boardGrabbedPieceInfo.piece,
      this.calcTransitionDelay(oldPos, newPos)
    );
    this.possMoves = [];
    this.board.grabbedPieceInfo = null;
  }

  calcTransitionDelay(oldPos: Pos, newPos: Pos) {
    const distanceX = Math.abs(newPos.x - oldPos.x);
    const distanceY = Math.abs(newPos.y - oldPos.y);
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    return distance * 25;
  }

  substractAbsPinsFromPossMoves(possMoves: Pos[], absPins: Pin[], pos: Pos) {
    for (let p=0 ; p<absPins.length ; p++) {
      if (
        absPins[p].pinnedPiecePos.x === pos.x && 
        absPins[p].pinnedPiecePos.y === pos.y
      ) {
        possMoves = possMoves.filter(move => {
          const simplifyXAndY = (this.num === PIECES.knight) ? false : true; // simplify means make 1 if >1 and -1 if <-1
          const moveDir = new Dir(move.y-pos.y, move.x-pos.x, simplifyXAndY);
          return (
            (moveDir.x === 0 && moveDir.y === 0) ||
            (moveDir.x    === absPins[p].pinDir.x && moveDir.y    === absPins[p].pinDir.y) ||
            (moveDir.x*-1 === absPins[p].pinDir.x && moveDir.y*-1 === absPins[p].pinDir.y)  
          );
        });
      }
    }
    return possMoves;
  }

  removePossMovesIfKingIsChecked(possMoves: Pos[], myKing: King, pos: Pos ) {
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

  static piecesAreEqual(...pieces: Piece[]) {
    if (pieces.length === 0) {
      console.error("Not enough pieces to compare");
      return false;
    }
    const firstPiece = pieces[0];
    for (let i=1 ; i<pieces.length ; i++) {
      if (firstPiece !== pieces[i]) {
        return false;
      }
    }
    return true;
  }

  static getPieceNumByName(name: string): (number|null) {
    switch (name) {
      case "pawn":   return PIECES.pawn;
      case "rook":   return PIECES.rook;
      case "knight": return PIECES.knight;
      case "bishop": return PIECES.bishop;
      case "queen":  return PIECES.queen;
      case "king":   return PIECES.king;
      default:       return null;
    }
  }

  static getClassNameByPiece(pieceNum: number, pieceTeam: number) {
    const teamChar = (pieceTeam === TEAMS.black) ? "b" : "w";
    const name = (() => {
      switch (pieceNum) {
        case PIECES.king:   return "king";
        case PIECES.queen:  return "queen";
        case PIECES.bishop: return "bishop";
        case PIECES.knight: return "knight";
        case PIECES.rook:   return "rook";
        case PIECES.pawn:   return "pawn";
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