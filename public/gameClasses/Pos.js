export default class Pos {
    constructor(y, x) {
        this.y = y;
        this.x = x;
    }
    invert(fieldsInOneRow) {
        return new Pos(fieldsInOneRow - 1 - this.y, fieldsInOneRow - 1 - this.x);
    }
}
