import Pos from "./Pos.js";
export default class Dir extends Pos {
    constructor(y, x, simplifyDirections) {
        super(y, x);
        if (simplifyDirections) {
            this.y = this.simplifyDir(y);
            this.x = this.simplifyDir(x);
        }
    }
    simplifyDir(dir) {
        if (dir > 1) {
            return 1;
        }
        if (dir < -1) {
            return -1;
        }
        return 0;
    }
}
