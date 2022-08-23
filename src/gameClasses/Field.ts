import Piece from "./Pieces/Piece.js";
export default class Field {
  html: HTMLElement;
  piece: Piece;
  constructor(html: HTMLElement, piece: Piece) {
    this.html = html;
    this.piece = piece;
  }
}