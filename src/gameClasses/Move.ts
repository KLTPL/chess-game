import Piece from "./Pieces/Piece.js";
import Pos from "./Pos.js";

export default class Move {
  piece: Piece;
  from: Pos;
  to: Pos;
  capturedPiece: Piece | null;
  promotedTo: Piece | null;
  constructor(piece: Piece, from: Pos, to: Pos, capture: Piece | null) {
    this.piece = piece;
    this.from = from;
    this.to = to;
    this.capturedPiece = capture;
    this.promotedTo = null;
  }

  setPromotedTo(piece: Piece) {
    this.promotedTo = piece;
  }

  static capturesAreEqual(...captures: (Piece | null)[]) { //true if all captures are null
    if (captures.length === 0) {
      console.error("Not enough captures to compare");
      return false;
    }
    const firstCapture = captures[0];
    for (let i=1 ; i<captures.length ; i++) {
      if (firstCapture !== captures[i]) {
        return false;
      }
    }
    return true;
  }
}