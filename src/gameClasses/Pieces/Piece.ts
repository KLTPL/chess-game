import Board from "../Board.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import King from "./King.js";
import Check from "../Check.js";
import GrabbedPieceInfo from "./GrabbedPieceInfo.js";

export default class Piece {
  value: number;
  num: number;
  team: number;
  html: (HTMLElement | null);
  board: Board;
  possMoves: Pos[];
  constructor(team: number, html: HTMLElement | null, board: Board) {
    this.value = 0;
    this.num = 0;
    this.team = team;
    this.html = html;
    this.board = board;
    this.possMoves = [];
    if (this.html !== null) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
    }
  }

  enemyTeamNum() {
    return (
      (this.team === this.board.whiteNum) ? 
      this.board.blackNum : 
      this.board.whiteNum
    );
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    pos
    let possibleMoves: Pos[] = [];
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    pos
    let possibleMoves: Pos[] = [];
    return possibleMoves;
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
    const thisHtml = this.html as HTMLElement;
    ev.preventDefault();
    this.board.highlightFieldUnderMovingPiece(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));
    const trans = thisHtml.style.transform;
    const oldTranslateX = thisHtml.style.transform.slice(
      trans.indexOf("translateX"), 
      trans.indexOf("translateY")-1
    );
    const oldTranslateY = thisHtml.style.transform.slice(
      trans.indexOf("translateY"), 
      trans.length
      );
    const newTranslateX = 
      `translateX(${
          ev.clientX -
          (this.board.pageContainerHtml.offsetWidth - this.board.piecesHtml.offsetWidth) /
          2 -
          thisHtml.offsetWidth/2
      }px)`;
    const newTranslateY = 
      `translateY(${
        ev.clientY -
        (this.board.pageContainerHtml.offsetHeight - this.board.piecesHtml.offsetHeight) /
        2 -
        thisHtml.offsetWidth/2
      }px)`;
    const coor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    thisHtml.style.transform = 
      `${(coor.x === -1) ? oldTranslateX : newTranslateX}
       ${(coor.y === -1) ? oldTranslateY : newTranslateY}
      `;
  }

  stopFollowingCursor = (ev: MouseEvent) => {
    const thisHtml = this.html as HTMLElement;
    const boardGrabbedPieceInfo = this.board.grabbedPieceInfo as GrabbedPieceInfo;
    thisHtml.id = "";
    if( document.getElementById("fieldHighlightedUnderMovingPiece") ) {
      (document.getElementById("fieldHighlightedUnderMovingPiece") as HTMLElement).id = "";
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
        (newPos.x !== boardGrabbedPieceInfo.grabbedFrom.x || 
         newPos.y !== boardGrabbedPieceInfo.grabbedFrom.y)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          boardGrabbedPieceInfo.piece
        );
        this.possMoves = [];
        this.board.grabbedPieceInfo = null;
        return;
      }
    }
    this.board.placePieceInPos(
      boardGrabbedPieceInfo.grabbedFrom, 
      boardGrabbedPieceInfo.piece,
    );
    this.possMoves = [];
    this.board.grabbedPieceInfo = null;
  }

  substractAbsPinsFromPossMoves(possMoves: Pos[], absPins: Pin[], pos: Pos) {
    for (let p=0 ; p<absPins.length ; p++) {
      if (
        absPins[p].pinnedPiecePos.x === pos.x && 
        absPins[p].pinnedPiecePos.y === pos.y
      ) {
        for (let m=0 ; m<possMoves.length ; m++) {
          const simplifyXAndY = (this.num === this.board.knightNum) ? false : true; // simplify means make 1 if >1 and -1 if <-1
          const moveDir = new Dir(possMoves[m].y-pos.y, possMoves[m].x-pos.x, simplifyXAndY);
          if( 
            ( moveDir.x === 0 && moveDir.y === 0 ) ||
            ( moveDir.x    === absPins[p].pinDir.x && moveDir.y    === absPins[p].pinDir.y ) ||
            ( moveDir.x*-1 === absPins[p].pinDir.x && moveDir.y*-1 === absPins[p].pinDir.y )
          ) {
            continue; 
          }
          possMoves.splice(m, 1);
          m--;
        }
      }
    }
    return possMoves;
  }

  removePossMovesIfKingIsChecked( possMoves: Pos[], myKing: King, pos: Pos ) {
    if (myKing.checks.length <= 0) {
      return possMoves;
    }
    if (myKing.checks.length === 2) {
      return [];
    }

    for (let m=0 ; m<possMoves.length ; m++) {
      if (possMoves[m].x === pos.x && possMoves[m].y === pos.y) {
        continue;
      }
      for (let c=0 ; c<myKing.checks.length ; c++) {
        if (!this.moveIsACaptureOrIsOnTheWayOfACheck(myKing.checks[c], possMoves[m])) {
          possMoves.splice(m, 1);
          m--;
        }
      }
    } 
    return possMoves;
  }

  moveIsACaptureOrIsOnTheWayOfACheck(check: Check, move: Pos) {
    const isCapture = (
      check.checkingPiecePos.x === move.x && 
      check.checkingPiecePos.y === move.y
    );
    let isOnTheLine = false;
    for (let field of check.fieldsInBetweenPieceAndKing) {
      if (move.isEqualTo(field)) {
        isOnTheLine = true;
      }
    }
    return isCapture || isOnTheLine;
  }

  sideEffectsOfMove(to: Pos, from: Pos) {to; from}
}