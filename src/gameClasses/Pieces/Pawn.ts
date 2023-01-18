import Board, { FIELDS_IN_ONE_ROW } from "../Board.js";
import Piece, { AnyPiece, CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, PIECES, TEAMS } from "./Piece.js";
import Pos from "../Pos.js";
import PawnPromotionMenu from "../PawnPromotionMenu.js";

export default class Pawn extends Piece {
  public value: number = 1;
  public id: PIECES = PIECES.PAWN;
  directionY: number;
  constructor(readonly team: TEAMS, protected board: Board) {
    super(team, board);
    this.directionY = (this.team === TEAMS.WHITE) ? -1 : 1;// direction up od down
    this.addClassName(this.id);
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const capturePos = [new Pos(pos.y+this.directionY, pos.x+1), new Pos(pos.y+this.directionY, pos.x-1)]
      .filter(capture => this.board.isPosInBoard(capture));
    return capturePos;
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.createArrOfAbsolutePins();

    const enPassantPawns = this.createArrOfPosOfPawnsThatCanBeCapturedByEnPassant(pos);
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

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum;
    const capturePos = this.createArrOfPossibleMovesFromPosForKing(pos)
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

  private createArrOfPosOfPawnsThatCanBeCapturedByEnPassant(pos: Pos): Pos[] {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum;
    const pawnsToCapturePos = [new Pos(pos.y, pos.x+1), new Pos(pos.y, pos.x-1)];
    return pawnsToCapturePos
      .filter(pawnToCapturePos => {
        const newCapture = new Pos(pos.y+this.directionY, pawnToCapturePos.x);
        const lastMove = board.movesSystem.getLatestHalfmove();
        const isPawnAfterMoving2SqueresForward = Math.abs(lastMove?.from.y - lastMove?.to.y) > 1;
        const piece = (board.isPosInBoard(pawnToCapturePos)) ? board.el[pawnToCapturePos.y][pawnToCapturePos.x].piece : null;
        return (
          board.isPosInBoard(newCapture) &&
          Piece.isPawn(piece) &&
          piece?.team === enemyTeamNum && 
          piece === lastMove.piece &&
          isPawnAfterMoving2SqueresForward &&
          !this.isPawnPinnedAbsolutely(pawnToCapturePos, pos.x)
        );
      });
  }
  
  private isPawnPinnedAbsolutely(pawn: Pos, pawnToBeCapturedPosX: number): boolean {
    const kingPos = this.board.getKingPosByTeam(this.team);
    const isPawnInlineWithKingHoryzontally = (pawn.y-kingPos.y === 0);
    return isPawnInlineWithKingHoryzontally && this.isRookOrQueenPinningPawns(pawn.y, kingPos.x, pawn.x, pawnToBeCapturedPosX);
  }

  private isRookOrQueenPinningPawns(
    yPos: number, 
    kingPosX: number, 
    pawnPosX: number, 
    pawnToBeCapturedPosX: number
  ): boolean {
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

  private isPinPossibleFromKingToPawns(
    yPos: number, 
    startPawnXPos: number, 
    pinDir: number, 
    kingPosX: number
  ): boolean {
    let tempXPos = startPawnXPos + pinDir;
    for ( ; tempXPos !== kingPosX ; tempXPos += pinDir) {
      if (this.board.el[yPos][tempXPos].piece !== null) {
        return false;
      }
    }
    return true;
  }

  private isPinPossibleFromPawnsToEdgeOfBoard(yPos: number, startPawnXPos: number, pinDir: number): boolean {
    const enemyTeamNum = this.enemyTeamNum;
    let tempXPos = startPawnXPos+pinDir;
    for ( ; this.board.isPosInBoard(new Pos(yPos, tempXPos)) ; tempXPos += pinDir) {
      const piece = this.board.el[yPos][tempXPos].piece;
      if (
        piece !== null &&
        piece?.team === this.team ||
        (piece?.team === enemyTeamNum &&
         !Piece.isQueen(piece) &&
         !Piece.isRook(piece))
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

  public sideEffectsOfMove(to: Pos): void {
    // en passant capture
    const board = this.board;
    const enPassantPos = new Pos(to.y-this.directionY, to.x);
    const enPassanPiece = board.el[enPassantPos.y][enPassantPos.x].piece;
    if (
      board.isPosInBoard(enPassantPos) &&
      Piece.isPawn(enPassanPiece) &&
      enPassanPiece === board.movesSystem.getLatestHalfmove().piece
    ) {
      board.removePieceInPos(enPassantPos, true);
    }

    // promotion
    const lastRowNum = 
      (this.directionY === 1 && !board.isInverted) ? 
      FIELDS_IN_ONE_ROW-1 : 
      0;
    if (to.y === lastRowNum) {
      this.promote(to);
    }
  }

  private promote(pos: Pos): void {
    this.board.pawnPromotionMenu = new PawnPromotionMenu(this.team, this.board);
    this.board.pawnPromotionMenu.playerIsChoosing
    .then((newPieceNum: number) => {
      const pawnGotPromotedTo = this.board.createNewPieceObj(newPieceNum, this.team, this.board);
      this.board.removePieceInPos(pos, true);
      this.board.placePieceInPos(pos, pawnGotPromotedTo, CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, true);
      (this.board.pawnPromotionMenu as PawnPromotionMenu).removeMenu();
      this.board.pawnPromotionMenu = null;
      this.board.markFieldUnderKingIfKingIsInCheck(this.enemyTeamNum);
      this.board.movesSystem.getLatestHalfmove().setPromotedTo(pawnGotPromotedTo as AnyPiece);
    });
  }
}