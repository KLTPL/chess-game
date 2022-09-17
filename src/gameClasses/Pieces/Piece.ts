import Board from "../Board.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import King from "./King.js";
import Check from "../Check.js";

export default class Piece {
  num: number;
  team: (number|null);
  html: (HTMLElement|null);
  board: Board;
  value: number;
  pos: (Pos|null);
  possMoves: Pos[];
  constructor(team: number, html: HTMLElement, board: Board) {
    this.num = 0;
    this.team = team;
    this.html = html;
    this.board = board;
    this.pos = null;
    this.possMoves = [];
    if( this.html!==null ) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
    }
  }

  enemyTeamNum() {
    return (this.team===this.board.whiteNum) ? this.board.blackNum : this.board.whiteNum;
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    let possibleMoves: Pos[] = [];
    return possibleMoves;
  }

  startFollowingCursor = (ev: MouseEvent) => {
    const leftClickNum = 0;
    const fieldCoor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    if( this.board.currTeam!==this.team || ev.button!==leftClickNum || this.board.pawnPromotionMenu || this.board.grabbedPiece!==null || !this.board.match.gameRunning ) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
      return;
    }
    this.possMoves = this.getPossibleMovesFromPos(fieldCoor);
    this.board.showPossibleMoves(this.possMoves, this.enemyTeamNum());
    let mouseHold = new Promise<void>((resolve, reject) => {
      this.html.addEventListener(
        "mouseup", 
        () => {
          reject();
        }, 
        {once: true}
      );
      setTimeout(() => {
        resolve();
      }, 150);
    });

    this.board.grabbedPiece = this;
    this.board.grabbedPiece.pos = fieldCoor;
    this.board.removePieceInPos(fieldCoor);
    this.html.id = "move";
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
          "click", 
          this.stopFollowingCursor, 
          {once: true}
        )
      });
    });

  }

  moveToCursor = (ev: MouseEvent) => {
    this.board.highlightFieldUnderMovingPiece(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));
    const trans = this.html.style.transform;
    const oldTranslateX = this.html.style.transform.slice(trans.indexOf("translateX"), trans.indexOf("translateY")-1);
    const oldTranslateY = this.html.style.transform.slice(trans.indexOf("translateY"), trans.length);
    const newTranslateX = 
      `translateX(${
          ev.clientX-(this.board.pageContainerHtml.offsetWidth-this.board.piecesHtml.offsetWidth)/2-this.html.offsetWidth/2
      }px)`;
    const newTranslateY = 
      `translateY(${
        ev.clientY-(this.board.pageContainerHtml.offsetHeight-this.board.piecesHtml.offsetHeight)/2-this.html.offsetWidth/2
      }px)`;
    const coor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    this.html.style.transform = 
      `${(coor.x===-1) ? oldTranslateX : newTranslateX}
       ${(coor.y===-1) ? oldTranslateY : newTranslateY}
      `;
  }

  stopFollowingCursor = (ev: MouseEvent) => {
    this.html.id = "";
    if( document.getElementById("fieldHighlightedUnderMovingPiece") ) {
      document.getElementById("fieldHighlightedUnderMovingPiece").id = "";
    }
    document.removeEventListener(
      "mousemove", 
      this.moveToCursor
    );
    this.board.hidePossibleMoves();
    const newPos = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
    const oldPos = this.board.grabbedPiece.pos;
    for( let i=0 ; i<this.possMoves.length ; i++ ) {
      if( 
        this.possMoves[i].x===newPos.x && this.possMoves[i].y===newPos.y &&
        (newPos.x!==this.board.grabbedPiece.pos.x || newPos.y!==this.board.grabbedPiece.pos.y)
      ) {
        this.board.movePiece(
          oldPos,
          newPos,
          this.board.grabbedPiece
        );
        this.possMoves = [];
        this.board.grabbedPiece = null;
        return;
      }
    }
    this.board.placePieceInPos(
      this.board.grabbedPiece.pos, 
      this.board.grabbedPiece,
    );
    this.possMoves = [];
    this.board.grabbedPiece = null;
  }

  substractAbsPinsFromPossMoves(possMoves: Pos[], absPins: Pin[], pos: Pos) {
    for( let p=0 ; p<absPins.length ; p++ ) {
      if( absPins[p].pinnedPiecePos.x===pos.x && absPins[p].pinnedPiecePos.y===pos.y ) {
        for( let m=0 ; m<possMoves.length ; m++ ) {
          const simplifyXAndY = (this.num===this.board.knightNum) ? false : true; // simplify means make 1 if >1 and -1 if <-1
          const moveDir = new Dir(possMoves[m].y-pos.y, possMoves[m].x-pos.x, simplifyXAndY);
          if( 
            ( moveDir.x===0 && moveDir.y===0 ) ||
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
    if( myKing.checks.length<=0 ) {
      return possMoves;
    }
    if( myKing.checks.length===2 ) {
      return [];
    }

    for( let m=0 ; m<possMoves.length ; m++ ) {
      if( possMoves[m].x===pos.x && possMoves[m].y===pos.y ) {
        continue;
      }
      for( let c=0 ; c<myKing.checks.length ; c++ ) {
        if( !this.moveIsACaptureOrIsOnTheWayOfACheck(myKing.checks[c], possMoves[m]) ) {
          possMoves.splice(m, 1);
          m--;
        }
      }
    } 
    return possMoves;
  }

  moveIsACaptureOrIsOnTheWayOfACheck(check: Check, move: Pos) {
    const isACapture = check.checkingPiecePos.x===move.x && check.checkingPiecePos.y===move.y;
    let isOnTheLine = false;
    for( let field of check.fieldsInBetweenPieceAndKing ) {
      if( move.x===field.x && move.y===field.y ) {
        isOnTheLine = true;
      }
    }
    return isACapture || isOnTheLine;
  }

  sideEffectsOfMove( to: Pos, from: Pos ) {
  }
}