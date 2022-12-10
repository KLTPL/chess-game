import Board, { FIELDS_IN_ONE_ROW } from "../Board.js";
import Piece, { PIECES, TEAMS } from "./Piece.js";
import Pos from "../Pos.js";
import PawnPromotionMenu from "../PawnPromotionMenu.js";

export default class Pawn extends Piece {
  directionY: number;
  constructor(team: number, board: Board) {
    super(team, board);
    this.num = PIECES.pawn;
    this.value = 1;
    this.directionY = (this.team === TEAMS.white) ? -1 : 1;// direction up od down

    this.addClassName(PIECES.pawn);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    const capturePos = [new Pos(pos.y+this.directionY, pos.x+1), new Pos(pos.y+this.directionY, pos.x-1)]
      .filter(capture => this.board.posIsInBoard(capture));
    return capturePos;
  }

  
  getPossibleMovesFromPos(pos: Pos) {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum();
    const myKing = this.board.getKingByTeamNum(this.team);
    const absPins = myKing.getPossitionsOfAbsolutePins();

    const possibleMovesFromPosForKing = this.getPossibleMovesFromPosForKing(pos)
      .filter(move => board.el[move.y][move.x].piece?.team === enemyTeamNum);

    let possibleMoves: Pos[] = [pos, ...possibleMovesFromPosForKing];
    if (board.el[pos.y+this.directionY][pos.x].piece === null) { // forward and double forward
      possibleMoves.push(new Pos(pos.y+this.directionY, pos.x));
      const pawnStartRow = (this.directionY === 1) ? 1 : FIELDS_IN_ONE_ROW-2;
      if( 
        pos.y === pawnStartRow &&   
        board.posIsInBoard(new Pos(pos.y+(this.directionY*2), pos.x)) &&
        board.el[pos.y+(this.directionY*2)][pos.x].piece === null
      ) {
        possibleMoves.push(new Pos(pos.y+(this.directionY*2), pos.x));
      }
    }

    //en passant capture
    const pawnsToCapturePos = [new Pos(pos.y, pos.x+1), new Pos(pos.y, pos.x-1)];
    for (const capturePos of pawnsToCapturePos) {
      const newCapture = new Pos(pos.y+this.directionY, capturePos.x);
      if (
        board.posIsInBoard(newCapture) &&
        board.el[capturePos.y][capturePos.x].piece?.num  === PIECES.pawn &&
        board.el[capturePos.y][capturePos.x].piece?.team === enemyTeamNum && 
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
    // en passant capture
    const board = this.board;
    if (
      board.posIsInBoard(new Pos(to.y-this.directionY, to.x)) &&
      board.el[to.y-this.directionY][to.x].piece?.num === PIECES.pawn &&
      board.moves[board.moves.length-2].piece === board.el[to.y-this.directionY][to.x].piece
    ) {
      board.removePieceInPos(new Pos(to.y-this.directionY, to.x), true);
    }

    // promotion
    const lastRowNum = 
      (this.directionY === 1 && !board.inverted) ? 
      FIELDS_IN_ONE_ROW-1 : 
      0;
    if (to.y === lastRowNum) {
      this.promote(to);
    }
  }

  promote(pos: Pos) {
    this.board.pawnPromotionMenu = new PawnPromotionMenu(this.team, this.board);
    this.board.pawnPromotionMenu.playerIsChoosing
    .then((newPieceNum: number) => {
      const pawnGotPromotedTo = this.board.createNewPieceObj(newPieceNum, this.team);
      this.board.removePieceInPos(pos, true);
      this.board.placePieceInPos(pos, pawnGotPromotedTo, 0, true);
      (this.board.pawnPromotionMenu as PawnPromotionMenu).removeMenu();
      this.board.pawnPromotionMenu = null;
      this.board.getKingByTeamNum(this.enemyTeamNum()).updateChecksArr();
      this.board.moves[this.board.moves.length-1].setPromotedTo(pawnGotPromotedTo as Piece);
    });
  }
}