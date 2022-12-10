import Board, { FIELDS_IN_ONE_ROW } from "./Board.js";
import Pos from "./Pos.js";
import Dir from "./Dir.js";

const CLASS_NAMES = {
  arrowContainer: "arrow-container",
  arrowHead: "arrow-head",
  arrowTail: "arrow-tail"
};

export default class VisualizingArrow {
  // arr = arrow ||  arr = arrows
  board: Board;
  startPos: Pos;
  endPos: Pos;
  arrContainer: HTMLDivElement;
  constructor(board: Board, startPos: Pos, endPos: Pos) {
    this.board = board;
    this.startPos = startPos;
    this.endPos = endPos;
    const arrDir = new Dir(this.endPos.y-this.startPos.y, this.endPos.x-this.startPos.x);
    this.arrContainer = document.createElement("div");
    this.drawArrowOnBoard(arrDir);
  }

  drawArrowOnBoard(arrDir: Dir) {
    const arrLengthFields = 
      Math.sqrt(
        Math.abs(
          Math.pow(Math.abs(arrDir.x), 2) + Math.pow(Math.abs(arrDir.y), 2)
        )
      );
    const fieldWidth = this.board.html.offsetWidth / FIELDS_IN_ONE_ROW;
    const arrLengthPx = arrLengthFields * fieldWidth;
    const arrHeadLengthPx = fieldWidth / 2;
    const arrTailLengthPx = arrLengthPx - arrHeadLengthPx;

    const rotationDegOfVector = this.getRotationDegOfVector(arrDir);
    this.arrContainer.style.setProperty("--rotationDeg", `${-rotationDegOfVector}deg`);
    this.arrContainer.classList.add(CLASS_NAMES.arrowContainer);
    this.arrContainer.style.width = `${fieldWidth * 0.8}px`;
    this.arrContainer.style.height = `${fieldWidth * 0.8}px`;

    const arrowHead = document.createElement("div");
    arrowHead.style.setProperty("--headHeight", `${fieldWidth/2 + arrTailLengthPx}px`);
    arrowHead.classList.add(CLASS_NAMES.arrowHead);
    arrowHead.style.width = `${fieldWidth}px`;
    arrowHead.style.height = `${fieldWidth}px`;

    const arrowTail = document.createElement("div");
    arrowTail.style.setProperty("--halfOfFieldSize", `${fieldWidth/2}px`);
    arrowTail.classList.add(CLASS_NAMES.arrowTail);
    arrowTail.style.width = `${arrTailLengthPx + 1}px`;
    arrowTail.style.height = `${fieldWidth * 0.3}px`;
  
    this.arrContainer.append(arrowTail);
    this.arrContainer.append(arrowHead);
    this.board.el[this.startPos.y][this.startPos.x].html.append(this.arrContainer);
  }

  getRotationDegOfVector(vecDir: Dir) {
    const fromRadtoDegMultiplier = 180 / Math.PI;
    const rotationAngleDeg = Math.atan(Math.abs(vecDir.y)/Math.abs(vecDir.x)) * fromRadtoDegMultiplier;

    const verticallyOrHorizontally = this.getRotationDegVerticallyOrHorizontally(vecDir);
    if (verticallyOrHorizontally !== null) {
      return verticallyOrHorizontally;
    }

    const quadrantNum = this.getQuadrantNum(vecDir);
    return this.getRotationDegDiagonally(rotationAngleDeg, quadrantNum);
  }

  getRotationDegVerticallyOrHorizontally(dir: Dir): (null | 0 | 90 | 180 | 270) {
    if (dir.y === 0) {
      if (dir.simplifyDir(dir.x) === 1) {
        return 0;
      } else { // dir.simplifyDir(dir.x) === -1
        return 180;
      }
    }
    if (dir.x === 0) {
      if (dir.simplifyDir(dir.y) === -1) {
        return 90;
      } else { // dir.simplifyDir(dir.y) === 1
        return 270;
      }
    }
    return null;
  }

  getQuadrantNum(aDir: Dir): (1 | 2 | 3 | 4) {
    const dir = new Dir( //simeplified direction
      aDir.simplifyDir(aDir.y), 
      aDir.simplifyDir(aDir.x)
    ); 
    if (dir.x === 1) {
      if (dir.y === -1) {
        return 1;
      } // simDir.y === 1
      return 4;  
    }
    // simDir.x === -1
    if (dir.y === -1) {
      return 2;
    } // simDir.y === 1
    return 3;
  }

  getRotationDegDiagonally(rotationAngleDeg: number, quadrantNum: (1|2|3|4)) {
    switch (quadrantNum) {
      case 1: return rotationAngleDeg;
      case 2: return 180 - rotationAngleDeg;
      case 3: return 180 + rotationAngleDeg;
      case 4: return 360 - rotationAngleDeg;
    }
  }
}