import Board, { FIELDS_IN_ONE_ROW } from "../Board.js";
import Piece, { PIECES, TEAMS } from "./Piece.js";
import Pos from "../Pos.js";
import PawnPromotionMenu from "../PawnPromotionMenu.js";

export default class Pawn extends Piece {
  directionY: number;
  constructor(team: number, board: Board) {
    super(team, board);
    this.id = PIECES.PAWN;
    this.value = 1;
    this.directionY = (this.team === TEAMS.WHITE) ? -1 : 1;// direction up od down

    this.addClassName(this.id);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    const capturePos = [new Pos(pos.y+this.directionY, pos.x+1), new Pos(pos.y+this.directionY, pos.x-1)]
      .filter(capture => this.board.isPosInBoard(capture));
    return capturePos;
  }

  
  getPossibleMovesFromPos(pos: Pos) {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.createArrOfAbsolutePins();

    const enPassantPawns = this.createArrOfPawnsThatCanBeCapturedByEnPassant(pos);
    const enPassantCaptures = enPassantPawns.map(capturePos => new Pos(pos.y+this.directionY, capturePos.x));
    let possibleMoves: Pos[] = [
      pos,
      ...this.createArrOfNormalMoves(pos), 
      ...enPassantCaptures,
    ];
    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsInCheck(possibleMoves, myKing, pos);

    return possibleMoves;
  }

  createArrOfNormalMoves(pos: Pos) {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum();
    const capturePos = this.getPossibleMovesFromPosForKing(pos)
      .filter(move => board.el[move.y][move.x].piece?.team === enemyTeamNum);
    
    const moves: Pos[] = [];
    if (board.el[pos.y+this.directionY][pos.x].piece === null) { // forward and double forward
      moves.push(new Pos(pos.y+this.directionY, pos.x));
      const pawnStartRow = (this.directionY === 1) ? 1 : FIELDS_IN_ONE_ROW-2;
      if( 
        pos.y === pawnStartRow &&   
        board.isPosInBoard(new Pos(pos.y+(this.directionY*2), pos.x)) &&
        board.el[pos.y+(this.directionY*2)][pos.x].piece === null
      ) {
        moves.push(new Pos(pos.y+(this.directionY*2), pos.x));
      }
    }

    return [...moves, ...capturePos];
  }

  createArrOfPawnsThatCanBeCapturedByEnPassant(pos: Pos) {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum();
    const pawnsToCapturePos = [new Pos(pos.y, pos.x+1), new Pos(pos.y, pos.x-1)];
    return pawnsToCapturePos
      .filter(pawn => {
        const newCapture = new Pos(pos.y+this.directionY, pawn.x);
        const lastMove = board.moves[board.moves.length-1];
        const isPawnAfterMoving2SqueresForward = Math.abs(lastMove?.from.y - lastMove?.to.y) > 1;
        return (
          board.isPosInBoard(newCapture) &&
          board.el[pawn.y][pawn.x].piece?.id === PIECES.PAWN &&
          board.el[pawn.y][pawn.x].piece?.team === enemyTeamNum && 
          board.el[pawn.y][pawn.x].piece === lastMove.piece &&
          isPawnAfterMoving2SqueresForward &&
          !this.isPawnPinnedAbsolutely(pawn, pos.x)
        );
      });
  }
  
  isPawnPinnedAbsolutely(pawn: Pos, pawnToBeCapturedPosX: number) {
    const kingPos = this.board.findKingPos(this.team);
    const isPawnInlineWithKingHoryzontally = (pawn.y-kingPos.y === 0);
    return isPawnInlineWithKingHoryzontally && this.isRookOrQueenPinningPawns(pawn.y, kingPos.x, pawn.x, pawnToBeCapturedPosX);
  }

  isRookOrQueenPinningPawns(yPos: number, kingPosX: number, pawnPosX: number, pawnToBeCapturedPosX: number) {
    // this problem can be seen in this position (FEN notation): 8/1p3p2/8/K1PrP3/8/8/8/7k b - - 0 1
    const pinDir = (pawnPosX > kingPosX) ? 1 : -1;
    const pawnsNextToEachOther = {
      left:  (pawnPosX < pawnToBeCapturedPosX) ? pawnPosX : pawnToBeCapturedPosX,
      right: (pawnPosX > pawnToBeCapturedPosX) ? pawnPosX : pawnToBeCapturedPosX,
    };
    const pawnKingSideX = (pawnPosX > kingPosX) ? pawnsNextToEachOther.left : pawnsNextToEachOther.right;
    const pawnOtherSideX = (pawnPosX < kingPosX) ? pawnsNextToEachOther.left : pawnsNextToEachOther.right;

 
    return (
      this.isPinPossibleFromKingToPawns(yPos, pawnKingSideX, -pinDir, kingPosX) && 
      this.isPinPossibleFromPawnsToEdgeOfBoard(yPos, pawnOtherSideX, pinDir)
    );
  }

  isPinPossibleFromKingToPawns(yPos: number, startPawnXPos: number, pinDir: number, kingPosX: number) {
    let tempXPos = startPawnXPos + pinDir;
    for ( ; tempXPos !== kingPosX ; tempXPos += pinDir) {
      if (this.board.el[yPos][tempXPos].piece !== null) {
        return false;
      }
    }
    return true;
  }

  isPinPossibleFromPawnsToEdgeOfBoard(yPos: number, startPawnXPos: number, pinDir: number) {
    const enemyTeamNum = this.enemyTeamNum();
    let tempXPos = startPawnXPos+pinDir;
    for ( ; this.board.isPosInBoard(new Pos(yPos, tempXPos)) ; tempXPos += pinDir) {
      if (
        this.board.el[yPos][tempXPos].piece !== null &&
        this.board.el[yPos][tempXPos].piece?.team === this.team ||
        (this.board.el[yPos][tempXPos].piece?.team === enemyTeamNum &&
        this.board.el[yPos][tempXPos].piece?.id !== PIECES.QUEEN &&
        this.board.el[yPos][tempXPos].piece?.id !== PIECES.ROOK)
      ) {
        return false;
      }
      if (
        this.board.el[yPos][tempXPos].piece?.team === enemyTeamNum
      ) {
        return true;
      }
    }
    return false;
  }

  sideEffectsOfMove(to: Pos) {
    // en passant capture
    const board = this.board;
    if (
      board.isPosInBoard(new Pos(to.y-this.directionY, to.x)) &&
      board.el[to.y-this.directionY][to.x].piece?.id === PIECES.PAWN &&
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
      this.board.getKingByTeam(this.enemyTeamNum()).updateChecksArr();
      this.board.moves[this.board.moves.length-1].setPromotedTo(pawnGotPromotedTo as Piece);
    });
  }
}