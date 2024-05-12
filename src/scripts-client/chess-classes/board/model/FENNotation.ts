import { PIECE_SYMBOLS } from "../../../../db/types";
import {
  type AnyPieceModel,
  PIECES,
  TEAMS,
} from "../../pieces/model/PieceModel";
import {
  type ArrOfPieces2d,
  type CastlingRights,
  FIELDS_IN_ONE_ROW,
} from "./BoardModel";
import type BoardModel from "./BoardModel";

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
  private board: BoardModel;
  private piecePlacement: string;
  private activeColor: string;
  private castlingRights: string;
  private enPassantTargets: string;
  private halfmoveClock: string;
  private fullmoveClock: string;
  constructor(FEN: string | null, board: BoardModel) {
    this.board = board;
    const parsts = this.createArrOfIndividualPartsOfFenNotation(FEN);
    this.piecePlacement = parsts[0] === null ? DEFAULT_VALUES[0] : parsts[0];
    this.activeColor = parsts[1] === null ? DEFAULT_VALUES[1] : parsts[1];
    this.castlingRights = parsts[2] === null ? DEFAULT_VALUES[2] : parsts[2];
    this.enPassantTargets = parsts[3] === null ? DEFAULT_VALUES[3] : parsts[3];
    this.halfmoveClock = parsts[4] === null ? DEFAULT_VALUES[4] : parsts[4];
    this.fullmoveClock = parsts[5] === null ? DEFAULT_VALUES[5] : parsts[5];
  }

  private createArrOfIndividualPartsOfFenNotation(
    FEN: string | null
  ): null[] | string[] {
    return FEN === null
      ? Array(AMOUNT_OF_PARTS_IN_FEN_NOTATION).fill(null)
      : FEN.split(" ");
  }

  get piecePlacementConverted(): ArrOfPieces2d {
    if (this.piecePlacement === DEFAULT_VALUES[0]) {
      return this.createMapOfPiecesInDefaultPos();
    }

    const piecePlacementSeperated =
      this.createArrOfPiecesPositionsSeperatedByRows();
    let pieces: ArrOfPieces2d = [];
    for (let r = 0; r < piecePlacementSeperated.length; r++) {
      pieces.push([]);
      for (let c = 0; c < piecePlacementSeperated[r].length; c++) {
        const char = piecePlacementSeperated[r][c];
        const charInt = parseInt(char);
        if (!isNaN(charInt)) {
          const amountOfEmptyFields = charInt;
          pieces[pieces.length - 1].push(
            ...Array(amountOfEmptyFields).fill(null)
          );
        } else {
          pieces[pieces.length - 1].push(
            FENNotation.convertPieceFENToPieceObj(char, this.board)
          );
        }
      }
      if (pieces[pieces.length - 1].length > FIELDS_IN_ONE_ROW) {
        console.error(`Too many pieces in row ${r + 1} (FEN notation)`);
        pieces[pieces.length - 1] = pieces[pieces.length - 1].slice(
          0,
          FIELDS_IN_ONE_ROW
        );
      } else if (pieces[pieces.length - 1].length < FIELDS_IN_ONE_ROW) {
        console.error(`Too few pieces in row ${r + 1} (FEN notation)`);
        const amountOfEmtyFields =
          FIELDS_IN_ONE_ROW - pieces[pieces.length - 1].length;
        pieces[pieces.length - 1] = [
          ...pieces[pieces.length - 1],
          ...Array(amountOfEmtyFields).fill(null),
        ];
      }
    }
    return pieces;
  }

  get activeColorConverted(): TEAMS {
    return this.activeColor === "b" ? TEAMS.BLACK : TEAMS.WHITE;
  }

  get castlingRightsConverted(): CastlingRights {
    return {
      white: {
        k: this.castlingRights.includes("K"),
        q: this.castlingRights.includes("Q"),
      },
      black: {
        k: this.castlingRights.includes("k"),
        q: this.castlingRights.includes("q"),
      },
    };
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

  private createArrOfPiecesPositionsSeperatedByRows(): string[] {
    const piecePlacementSeperated = this.piecePlacement.split("/");
    if (piecePlacementSeperated.length > FIELDS_IN_ONE_ROW) {
      console.error("Too many rows of pieces (FEN notation)");
      return piecePlacementSeperated.slice(0, FIELDS_IN_ONE_ROW);
    }
    if (piecePlacementSeperated.length < FIELDS_IN_ONE_ROW) {
      console.error("Too few rows of pieces (FEN notation)");
      const amountOfEmptyRows =
        FIELDS_IN_ONE_ROW - piecePlacementSeperated.length;
      return [
        ...piecePlacementSeperated,
        ...Array(amountOfEmptyRows).fill("8"),
      ];
    }
    return piecePlacementSeperated;
  }

  private createMapOfPiecesInDefaultPos(): ArrOfPieces2d {
    const firstAndLastRowNums = [
      PIECES.ROOK,
      PIECES.KNIGHT,
      PIECES.BISHOP,
      PIECES.QUEEN,
      PIECES.KING,
      PIECES.BISHOP,
      PIECES.KNIGHT,
      PIECES.ROOK,
    ];
    const pieces = [
      firstAndLastRowNums.map((pieceNum) =>
        this.board.createNewPieceObj(pieceNum, TEAMS.BLACK, this.board)
      ),
      [...Array(FIELDS_IN_ONE_ROW)].map(() =>
        this.board.createNewPieceObj(PIECES.PAWN, TEAMS.BLACK, this.board)
      ),
      ...Array(FIELDS_IN_ONE_ROW / 2)
        .fill(null)
        .map(() => Array(FIELDS_IN_ONE_ROW).fill(null)),
      [...Array(FIELDS_IN_ONE_ROW)].map(() =>
        this.board.createNewPieceObj(PIECES.PAWN, TEAMS.WHITE, this.board)
      ),
      firstAndLastRowNums.map((pieceNum) =>
        this.board.createNewPieceObj(pieceNum, TEAMS.WHITE, this.board)
      ),
    ];

    return pieces;
  }

  public static convertPieceFENToId(pieceFEN: PIECE_SYMBOLS): PIECES {
    switch (pieceFEN) {
      case "r":
        return PIECES.ROOK;
      case "n":
        return PIECES.KNIGHT;
      case "b":
        return PIECES.BISHOP;
      case "q":
        return PIECES.QUEEN;
      case "k":
        return PIECES.KING;
      case "p":
        return PIECES.PAWN;
      default:
        throw new Error(
          `piece symbol '${pieceFEN}' is not recognized as any of the allowed FEN symbols`
        );
    }
  }

  public static convertPieceFENToPieceObj(
    pieceFEN: string,
    board: BoardModel
  ): AnyPieceModel {
    const lowerCase = pieceFEN.toLowerCase() as PIECE_SYMBOLS;
    const team = pieceFEN === lowerCase ? TEAMS.BLACK : TEAMS.WHITE;
    const id = FENNotation.convertPieceFENToId(lowerCase);

    return board.createNewPieceObj(id, team, board) as AnyPieceModel;
  }

  public static convertPieceIdToFEN(piece: PIECES): PIECE_SYMBOLS {
    switch (piece) {
      case PIECES.ROOK:
        return PIECE_SYMBOLS.ROOK;
      case PIECES.KNIGHT:
        return PIECE_SYMBOLS.KNIGHT;
      case PIECES.BISHOP:
        return PIECE_SYMBOLS.BISHOP;
      case PIECES.QUEEN:
        return PIECE_SYMBOLS.QUEEN;
      case PIECES.KING:
        return PIECE_SYMBOLS.KING;
      case PIECES.PAWN:
        return PIECE_SYMBOLS.PAWN;
    }
  }
}
