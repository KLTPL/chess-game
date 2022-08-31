export default class VisualizingArrowsArr {
    constructor(board) {
        this.board = board;
        this.arr = [];
    }
    getMatchingArrowNum(startPos, endPos) {
        for (let i = 0; i < this.arr.length; i++) {
            const arrSPos = this.arr[i].startPos;
            const arrEPos = this.arr[i].endPos;
            if (startPos.x === arrSPos.x && startPos.y === arrSPos.y &&
                endPos.x === arrEPos.x && endPos.y === arrEPos.y) {
                return i;
            }
        }
        return -1;
    }
    removeArrow(arrNum) {
        this.arr[arrNum].arrContainer.remove();
        this.arr.splice(arrNum, 1);
    }
    removeAllArrows() {
        while (this.arr.length > 0) {
            this.removeArrow(0);
        }
    }
}
