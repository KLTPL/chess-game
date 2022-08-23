import Pos from "./Pos.js";
import Dir from "./Dir.js";
export default class Pin {
  pinnedPiecePos: Pos;
  pinDir: Dir;
  constructor(pinnedPiecePos: Pos, pinDir: Dir) {
    this.pinnedPiecePos = pinnedPiecePos;
    this.pinDir = pinDir;
  }
}