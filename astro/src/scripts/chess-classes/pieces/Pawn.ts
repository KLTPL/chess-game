import Board, { FIELDS_IN_ONE_ROW } from "../board-components/Board";
import Piece, {
  type AnyPiece,
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
  PIECES,
  TEAMS,
} from "./Piece";
import Pos from "../Pos";
import PawnPromotionMenu from "../board-components/PawnPromotionMenu";

export default class Pawn extends Piece {
  public value: number = 1;
  public id: PIECES = PIECES.PAWN;
  private directionY: number;
  constructor(
    readonly team: TEAMS,
    protected board: Board
  ) {
    super(team, board);
    this.directionY = this.isWhite() ? -1 : 1; // direction up or down
    this.addClassName(this.id);
  }

  public invert() {
    this.directionY *= -1;
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const capturePos = [
      new Pos(pos.y + this.directionY, pos.x + 1),
      new Pos(pos.y + this.directionY, pos.x - 1),
    ].filter((capture) => Board.isPosIn(capture));
    return capturePos;
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.createArrOfAbsolutePins();

    const enPassantPawns =
      this.createArrOfPosOfPawnsThatCanBeCapturedByEnPassant(pos);
    const enPassantCaptures = enPassantPawns.map(
      (capturePos) => new Pos(pos.y + this.directionY, capturePos.x)
    );
    let possibleMoves: Pos[] = [
      pos,
      ...this.createArrOfNormalMoves(pos),
      ...enPassantCaptures,
    ];
    possibleMoves = this.substractAbsPinsFromPossMoves(
      possibleMoves,
      absPins,
      pos
    );
    possibleMoves = this.removePossMovesIfKingIsInCheck(
      possibleMoves,
      myKing,
      pos
    );

    return possibleMoves;
  }

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum;
    const capturePos = this.createArrOfPossibleMovesFromPosForKing(pos).filter(
      (move) => board.getPiece(move)?.team === enemyTeamNum
    );

    const moves: Pos[] = [];
    const newPos = new Pos(pos.y + this.directionY, pos.x);
    if (board.getPiece(newPos) === null) {
      // forward and double forward
      moves.push(newPos);
      const pawnStartRow = this.directionY === 1 ? 1 : FIELDS_IN_ONE_ROW - 2;
      const newPos2 = new Pos(pos.y + this.directionY * 2, pos.x);
      if (
        pos.y === pawnStartRow &&
        Board.isPosIn(newPos2) &&
        board.getPiece(newPos2) === null
      ) {
        moves.push(newPos2);
      }
    }

    return [...moves, ...capturePos];
  }

  private createArrOfPosOfPawnsThatCanBeCapturedByEnPassant(pos: Pos): Pos[] {
    const board = this.board;
    const enemyTeamNum = this.enemyTeamNum;
    const pawnsToCapturePos = [
      new Pos(pos.y, pos.x + 1),
      new Pos(pos.y, pos.x - 1),
    ];
    return pawnsToCapturePos.filter((pawnToCapturePos) => {
      const newCapture = new Pos(pos.y + this.directionY, pawnToCapturePos.x);
      const isAtLestOneMove = board.movesSystem.isThereAtLeastOneHalfMove();
      const lastMove = board.movesSystem.getLatestHalfmove();
      const isPawnAfterMoving2SqueresForward =
        Math.abs(lastMove?.from.y - lastMove?.to.y) > 1;
      const piece = Board.isPosIn(pawnToCapturePos)
        ? board.getPiece(pawnToCapturePos)
        : null;
      return (
        Board.isPosIn(newCapture) &&
        Piece.isPawn(piece) &&
        piece?.team === enemyTeamNum &&
        isAtLestOneMove &&
        piece === lastMove.piece &&
        isPawnAfterMoving2SqueresForward &&
        !this.isPawnPinnedAbsolutely(pawnToCapturePos, pos.x)
      );
    });
  }

  private isPawnPinnedAbsolutely(
    pawn: Pos,
    pawnToBeCapturedPosX: number
  ): boolean {
    const kingPos = this.board.getKingPosByTeam(this.team);
    const isPawnInlineWithKingHoryzontally = pawn.y - kingPos.y === 0;
    return (
      isPawnInlineWithKingHoryzontally &&
      this.isRookOrQueenPinningPawns(
        pawn.y,
        kingPos.x,
        pawn.x,
        pawnToBeCapturedPosX
      )
    );
  }

  private isRookOrQueenPinningPawns(
    yPos: number,
    kingPosX: number,
    pawnPosX: number,
    pawnToBeCapturedPosX: number
  ): boolean {
    // this problem can be seen in this position (FEN notation): 8/1p3p2/8/K1PrP3/8/8/8/7k b - - 0 1
    const pinDir = pawnPosX > kingPosX ? 1 : -1;
    const pawnsNextToEachOther = {
      left: pawnPosX < pawnToBeCapturedPosX ? pawnPosX : pawnToBeCapturedPosX,
      right: pawnPosX > pawnToBeCapturedPosX ? pawnPosX : pawnToBeCapturedPosX,
    };
    const pawnKingSideX =
      pawnPosX > kingPosX
        ? pawnsNextToEachOther.left
        : pawnsNextToEachOther.right;
    const pawnOtherSideX =
      pawnPosX < kingPosX
        ? pawnsNextToEachOther.left
        : pawnsNextToEachOther.right;

    return (
      this.isPinPossibleFromKingToPawns(
        yPos,
        pawnKingSideX,
        -pinDir,
        kingPosX
      ) &&
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
    for (; tempXPos !== kingPosX; tempXPos += pinDir) {
      const pos = new Pos(yPos, tempXPos);
      if (this.board.getPiece(pos) !== null) {
        return false;
      }
    }
    return true;
  }

  private isPinPossibleFromPawnsToEdgeOfBoard(
    yPos: number,
    startPawnXPos: number,
    pinDir: number
  ): boolean {
    const enemyTeamNum = this.enemyTeamNum;
    let tempXPos = startPawnXPos + pinDir;
    let currPos = new Pos(yPos, tempXPos);
    for (
      ;
      Board.isPosIn((currPos = new Pos(yPos, tempXPos)));
      tempXPos += pinDir
    ) {
      const piece = this.board.getPiece(currPos);
      if (
        (piece !== null && piece?.team === this.team) ||
        (piece?.team === enemyTeamNum &&
          !Piece.isQueen(piece) &&
          !Piece.isRook(piece))
      ) {
        return false;
      }
      if (piece?.team === enemyTeamNum) {
        return true;
      }
    }
    return false;
  }

  private isGoingUp(): boolean {
    return this.directionY === -1;
  }

  public sideEffectsOfMove(to: Pos): void {
    // en passant capture
    const board = this.board;
    const enPassantPos = new Pos(to.y - this.directionY, to.x);
    const enPassanPiece = board.getPiece(enPassantPos);
    if (
      Board.isPosIn(enPassantPos) &&
      Piece.isPawn(enPassanPiece) &&
      enPassanPiece === board.movesSystem.getLatestHalfmove().piece
    ) {
      board.removePieceInPos(enPassantPos, true);
    }

    // promotion
    const promotionPosY = this.isGoingUp() ? 0 : FIELDS_IN_ONE_ROW - 1;
    if (to.y === promotionPosY) {
      this.promote(to);
    }
  }

  private promote(pos: Pos): void {
    this.board.pawnPromotionMenu = new PawnPromotionMenu(this.team, this.board);
    this.board.pawnPromotionMenu.playerIsChoosing.then(
      (newPieceNum: number) => {
        const pawnGotPromotedTo = this.board.createNewPieceObj(
          newPieceNum,
          this.team,
          this.board
        );
        this.board.removePieceInPos(pos, true);
        this.board.placePieceInPos(
          pos,
          pawnGotPromotedTo,
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
          true
        );
        (this.board.pawnPromotionMenu as PawnPromotionMenu).removeMenu();
        this.board.pawnPromotionMenu = null;
        this.board.movesSystem
          .getLatestHalfmove()
          .setPromotedTo(pawnGotPromotedTo as AnyPiece);
      }
    );
  }
}
