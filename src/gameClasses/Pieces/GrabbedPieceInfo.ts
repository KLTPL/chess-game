import Pos from "../Pos";
import Piece, { AnyPiece } from "./Piece";

export default class GrabbedPieceInfo {
  constructor(
    public piece: (AnyPiece|Piece), 
    public grabbedFrom: Pos
  ) {}
}