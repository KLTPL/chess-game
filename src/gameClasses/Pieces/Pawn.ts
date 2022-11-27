import Board from "../Board.js";
import Piece from "./Piece.js";
import Pos from "../Pos.js";
import PawnPromotionMenu from "../PawnPromotionMenu.js";

export default class Pawn extends Piece {
  directionY: number;
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 1;
    this.value = 1;
    this.directionY = (this.team === this.board.whiteNum) ? -1 : 1;
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let takesPos = [new Pos(pos.y+this.directionY, pos.x+1), new Pos(pos.y+this.directionY, pos.x-1)]
      .filter(take => this.board.posIsInBoard(take));

    return takesPos;
  }

  
  getPossibleMovesFromPos(pos: Pos) {
    const board = this.board;
    const myKing = (this.team === board.whiteNum) ? board.kings.white : board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();

    let possibleMovesFromPosForKing = this.getPossibleMovesFromPosForKing(pos)
      .filter(move => board.el[move.y][move.x].piece.team === this.enemyTeamNum());
    let possibleMoves: Pos[] = [pos, ...possibleMovesFromPosForKing];
    if (board.el[pos.y+this.directionY][pos.x].piece.num === this.board.noPieceNum) {
      possibleMoves.push(new Pos(pos.y+this.directionY, pos.x));
      const pawnStartPosY = (this.directionY === 1) ? 1 : board.fieldsInOneRow-2;
      if( 
        pos.y === pawnStartPosY && 
        board.posIsInBoard(new Pos(pos.y+(this.directionY*2), pos.x)) &&
        !board.el[pos.y+(this.directionY*2)][pos.x].piece.num 
      ) {
        possibleMoves.push(new Pos(pos.y+(this.directionY*2), pos.x));
      }
    }

    //en passant capture
    const pawnsToCapturePos = [new Pos(pos.y, pos.x+1), new Pos(pos.y, pos.x-1)];
    for (let capturePos of pawnsToCapturePos) {
      const newCapture = new Pos(pos.y+this.directionY, capturePos.x);
      if (
        board.posIsInBoard(newCapture) &&
        board.el[capturePos.y][capturePos.x].piece.num  === board.pawnNum &&
        board.el[capturePos.y][capturePos.x].piece.team === this.enemyTeamNum() && 
        board.el[capturePos.y][capturePos.x].piece      === board.moves[board.moves.length-1].piece
      ) {
        possibleMoves.push(newCapture);
      }
    }

    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsChecked(possibleMoves, myKing, pos);

    return possibleMoves;
  }

  sideEffectsOfMove( to: Pos ) {
    //en passant capture
    const board = this.board;
    if (
      board.posIsInBoard(new Pos(to.y-this.directionY, to.x)) &&
      board.el[to.y-this.directionY][to.x].piece.num === board.pawnNum &&
      board.moves[board.moves.length-2].piece === board.el[to.y-this.directionY][to.x].piece
    ) {
      board.removePieceInPos(new Pos(to.y-this.directionY, to.x), true);
    }

    const lastRowNum = 
      (this.directionY === 1 && !board.inverted) ? 
      board.fieldsInOneRow-1 : 
      0;
    if (to.y===lastRowNum) {
      this.promote(to);
    }
  }

  promote (pos: Pos) {
    this.board.pawnPromotionMenu = new PawnPromotionMenu(this.team, this.board);
    this.board.pawnPromotionMenu.waitingForDecision
    .then((newPieceNum: number) => {
      const pawnGotPromotedTo = this.board.getNewPieceObj(newPieceNum, this.team);
      this.board.removePieceInPos(pos, true);
      this.board.placePieceInPos(pos, pawnGotPromotedTo, true);
      (this.board.pawnPromotionMenu as PawnPromotionMenu).removeMenu();
      this.board.pawnPromotionMenu = null;
    });
  }
}