import Pos from "./Pos.js"

export default class Dir extends Pos {
  constructor( y: number, x: number, simplifyXAndY?: boolean ) {
    super(y, x);
    if (simplifyXAndY) {
      this.y = this.simplifyDir(y);
      this.x = this.simplifyDir(x);
    }
  }

  simplifyDir(dirValue: number) {
    if (dirValue >= 1) {
      return 1;
    }
    if (dirValue <= -1) {
      return -1;
    }
    return 0;
  }  
}