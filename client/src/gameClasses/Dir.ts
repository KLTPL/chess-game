export default class Dir {
  constructor(
    public y: number,
    public x: number,
    simplifyXAndY?: boolean
  ) {
    if (simplifyXAndY) {
      this.y = this.simplifyDir(y);
      this.x = this.simplifyDir(x);
    }
  }

  isEqualTo(dir: Dir) {
    return this.x === dir.x && this.y === dir.y;
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
