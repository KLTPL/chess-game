import Pos from "./Pos";
export default class Dir extends Pos {
  constructor( y: number, x: number, simplifyDirections?: boolean ) {
    super(y, x);
    if( simplifyDirections ) {
      this.y = this.simplifyDir(y);
      this.x = this.simplifyDir(x);
    }
  }

  simplifyDir(dir: number) {
    if( dir>1 ) {
      return 1;
    }
    if( dir<-1 ) {
      return -1;
    }
    return 0;
  }  
}