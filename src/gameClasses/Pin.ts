import Pos from "./Pos";
import Dir from "./Dir";
export default class Pin {
  pinnedPiecePos: Pos;
  pinDir: Dir;
  constructor(pinnedPiecePos: Pos, pinDir: Dir) {
    this.pinnedPiecePos = pinnedPiecePos;
    this.pinDir = pinDir;
  }
}