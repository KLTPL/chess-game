import { PIECES, TEAMS } from "./Pieces/Piece";
import { ArrOfPieces2d, FIELDS_IN_ONE_ROW } from "./Board";
import Board from "./Board";

/*FEN (Forsyth-Edwards Notation) parts:
    1. Piece placement.
    2. Which color starts.
    3. Castling rights
    4. Possible en passant targets
    5. Halfmove clock
    6. Fullmove clock
  Default pos in FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
*/
const AMOUNT_OF_PARTS_IN_FEN_NOTATION = 6;
const DEFAULT_VALUES = [
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",
  "w",
  "KQkq",
  "-",
  "0",
  "1",
];

export default class FENNotation {
  private board: Board;
  private piecePlacement: string;
  private activeColor: string;
  private castlingRights: string;
  private enPassantTargets: string;
  private halfmoveClock: string;
  private fullmoveClock: string;
  constructor(FEN: string|null, board: Board) {
    this.board = board;
    const arr = this.createArrOfIndividualPartsOfFenNotation(FEN);
    this.piecePlacement =   (arr[0] === null) ? DEFAULT_VALUES[0] : arr[0];
    this.activeColor =      (arr[1] === null) ? DEFAULT_VALUES[1] : arr[1];
    this.castlingRights =   (arr[2] === null) ? DEFAULT_VALUES[2] : arr[2];
    this.enPassantTargets = (arr[3] === null) ? DEFAULT_VALUES[3] : arr[3];
    this.halfmoveClock =    (arr[4] === null) ? DEFAULT_VALUES[4] : arr[4];
    this.fullmoveClock =    (arr[5] === null) ? DEFAULT_VALUES[5] : arr[5];
  }

  private createArrOfIndividualPartsOfFenNotation(FEN: string|null): (null[] | string[]) {
    return (
      (FEN === null) ?
      Array(AMOUNT_OF_PARTS_IN_FEN_NOTATION).fill(null) :
      FEN.split(" ")
    );
  }

  get piecePlacementConverted(): ArrOfPieces2d {
    const piecePlacementSeperated = this.createArrOfPiecesPositionsSeperatedByRows();
    let pieces: ArrOfPieces2d = [];
    for (let r=0 ; r<piecePlacementSeperated.length ; r++) {
      pieces.push([]);
      for (let c=0 ; c<piecePlacementSeperated[r].length ; c++) {
        const char = piecePlacementSeperated[r][c];
        if (!isNaN(parseInt(char))) {
          const amountOfEmptyFields = parseInt(char);
          pieces[pieces.length-1].push(...Array(amountOfEmptyFields).fill(null));
        } else {
          pieces[pieces.length-1].push(this.convertCharToPieceObj(char));
        }
      }
      if (pieces[pieces.length-1].length > FIELDS_IN_ONE_ROW) {
        console.error(`Too many pieces in row ${r+1} (FEN notation)`);
        pieces[pieces.length-1] = pieces[pieces.length-1].slice(0, FIELDS_IN_ONE_ROW);
      } else if (pieces[pieces.length-1].length < FIELDS_IN_ONE_ROW) {
        console.error(`Too many few pieces in row ${r+1} (FEN notation)`);
        const amountOfEmtyFields = FIELDS_IN_ONE_ROW - pieces[pieces.length-1].length;
        pieces[pieces.length-1] = [...pieces[pieces.length-1], ...Array(amountOfEmtyFields).fill(null)];
      }
    }
    return pieces;
  }

  get activeColorConverted(): TEAMS.WHITE|TEAMS.BLACK {
    return (this.activeColor === "b") ? TEAMS.BLACK : TEAMS.WHITE;
  }

  get castlingRightsConverted() {
    return this.castlingRights;
  }

  get enPassantTargetsConverted() {
    return this.enPassantTargets;
  }

  get halfmoveClockConverted() {
    return this.halfmoveClock;
  }

  get fullmoveClockConverted() {
    return this.fullmoveClock;
  }

  createArrOfPiecesPositionsSeperatedByRows() {
    const piecePlacementSeperated = this.piecePlacement.split("/");
    if (piecePlacementSeperated.length > FIELDS_IN_ONE_ROW) {
      console.error("Too many rows of pieces (FEN notation)");
      return piecePlacementSeperated.slice(0, FIELDS_IN_ONE_ROW);
    }
    if (piecePlacementSeperated.length < FIELDS_IN_ONE_ROW) {
      console.error("Too few rows of pieces (FEN notation)");
      const amountOfEmptyRows = FIELDS_IN_ONE_ROW - piecePlacementSeperated.length;
      return [...piecePlacementSeperated, ...Array(amountOfEmptyRows).fill("8")];
    }
    return piecePlacementSeperated;
  }

  private convertCharToPieceObj(char: string) {
    const lowerCase = char.toLowerCase();
    const team = (char === lowerCase) ? TEAMS.BLACK : TEAMS.WHITE;
    const id = this.convertCharToPieceId(lowerCase);
    return this.board.createNewPieceObj(id, team);
  }

  private convertCharToPieceId(charLowerCase: string): number {
    switch (charLowerCase) {
      case "r": return PIECES.ROOK;
      case "n": return PIECES.KNIGHT;
      case "b": return PIECES.BISHOP;
      case "q": return PIECES.QUEEN;
      case "k": return PIECES.KING;
      default:  return PIECES.PAWN;
    }
  }
}