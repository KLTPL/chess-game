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
  defaultTransitionDelay: number;
  constructor(team: number, html: HTMLElement | null, board: Board) {
    this.value = 0;
    this.num = 0;
    this.team = team;
    this.html = html;
    this.board = board;
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
      trans.indexOf("(")+1, 
      trans.indexOf(",")
    );
    const oldTranslateY = thisHtml.style.transform.slice(
      trans.indexOf(",")+1, 
      trans.length-1
      );
    const newTranslateX = 
      `${
        ev.clientX -
        (this.board.pageContainerHtml.offsetWidth - this.board.piecesHtml.offsetWidth) /
        2 -
        thisHtml.offsetWidth/2
      }px`;
    const newTranslateY = 
      `${ev.clientY -
        (this.board.pageContainerHtml.offsetHeight - this.board.piecesHtml.offsetHeight) /
        2 -
        thisHtml.offsetWidth/2
      }px`;
    const coor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    const translateX = (coor.x === -1) ? oldTranslateX : newTranslateX;
    const translateY = (coor.y === -1) ? oldTranslateY : newTranslateY;
    thisHtml.style.transform = `translate(${translateX}, ${translateY})`;
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