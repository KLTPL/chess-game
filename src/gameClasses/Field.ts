import Piece from "./Pieces/Piece.js";

export default class Field {
  html: HTMLElement;
  piece: (Piece|null);
  constructor(html: HTMLElement) {
    this.html = html;
    this.piece = null;
  }

  setPiece(piece: (Piece|null)) {
    this.piece = piece;
  }
}