import Pos from "../Pos";
import Piece from "./Piece";

export default class GrabbedPieceInfo {
  piece: Piece;
  grabbedFrom: Pos;
  constructor(piece: Piece, grabbedFrom: Pos) {
    this.piece = piece;
    this.grabbedFrom = grabbedFrom;
  }
}