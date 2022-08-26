import Board from "../Board.js";
import Piece from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import PawnPromotionMenu from "../PawnPromotionMenu.js";

export default class Pawn extends Piece {
  directionY: number;
  haventMovedYet: boolean;
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 1;
    this.value = 1;
    this.haventMovedYet = true;
    this.directionY = (this.team===this.board.whiteNum) ? -1 : 1;
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];

    let takesPos = [new Pos(pos.y+this.directionY, pos.x+1), new Pos(pos.y+this.directionY, pos.x-1)];
    for( let i=0 ; i<takesPos.length ; i++ ) {
      if( takesPos[i].x<0 || takesPos[i].x>7 || takesPos[i].y<0 || takesPos[i].y>7 ) {
        takesPos.splice(i, 1);
        i--;
        continue;
      }
      possibleMoves.push(takesPos[i]);
    }
    return possibleMoves;
  }

  
  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===this.board.whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();

    let possibleMovesFromPosForKing = this.getPossibleMovesFromPosForKing(pos);
    for( let i=0 ; i<possibleMovesFromPosForKing.length ; i++ ) {
      if( 
        this.board.el[possibleMovesFromPosForKing[i].y][possibleMovesFromPosForKing[i].x].piece.team!==this.enemyTeamNum()
      ) {
        possibleMovesFromPosForKing.splice(i, 1);
        i--;
      }
    }
    let possibleMoves: Pos[] = [pos, ...possibleMovesFromPosForKing];
    if( !this.board.el[pos.y+this.directionY][pos.x].piece.num ) {
      possibleMoves.push(new Pos(pos.y+this.directionY, pos.x));
      if( this.haventMovedYet && !this.board.el[pos.y+(this.directionY*2)][pos.x].piece.num ) {
        possibleMoves.push(new Pos(pos.y+(this.directionY*2), pos.x));
      }
    }

    //en passant capture
    const pawnsToCapturePos = [new Pos(pos.y, pos.x+1), new Pos(pos.y, pos.x-1)];
    const enemyTeamNum = this.enemyTeamNum();
    for( let capturePos of pawnsToCapturePos ) {
      if( 
        capturePos.x>=0 && capturePos.x<=7 &&
        this.board.el[pos.y][capturePos.x].piece.team===enemyTeamNum && 
        this.board.moves[this.board.moves.length-1].piece===this.board.el[pos.y][capturePos.x].piece
      ) {
        possibleMoves.push(new Pos(pos.y+this.directionY, capturePos.x));
      }
    }

    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsChecked(possibleMoves, myKing, pos);

    return possibleMoves;
  }

  sideEffectsOfMove( to: Pos ) {
    if( this.haventMovedYet ) {
      this.haventMovedYet = false;
    }
    //en passant capture
    if(
      this.board.el[to.y-this.directionY][to.x].piece.num===this.board.pawnNum &&
      this.board.moves[this.board.moves.length-2].piece===this.board.el[to.y-this.directionY][to.x].piece
    ) {
      this.board.removePieceInPos(new Pos(to.y-this.directionY, to.x), true);
    }

    const lastRowNum = (this.directionY===1) ? this.board.fieldsInOneRow-1 : 0;
    if( to.y===lastRowNum ) {
      this.promote(to);
    }
  }

  promote( pos: Pos ) {
    this.board.pawnPromotionMenu = new PawnPromotionMenu(this.team, this.board);
    this.board.pawnPromotionMenu.askWhatPiecePlayerWants()
    .then( (newPieceNum: number) => {
      const pawnGotPromotedTo = this.board.getNewPieceObj(newPieceNum, this.team);
      this.board.removePieceInPos(pos, true);
      this.board.placePieceInPos(pos, pawnGotPromotedTo, true);
      this.board.pawnPromotionMenu.removeMenu();
      this.board.pawnPromotionMenu = null;
    });
  }
}