import Board, { FIELDS_IN_ONE_ROW } from "./Board.js";
import Pos from "./Pos.js";
import Dir from "./Dir.js";

const CLASS_NAMES = {
  arrowContainer: "arrow-container",
  arrowHead: "arrow-head",
  arrowTail: "arrow-tail"
};

export default class VisualizingArrow {
  private arrContainer: HTMLDivElement = document.createElement("div");
  constructor(private board: Board, private startPos: Pos, private endPos: Pos) {
    const arrDir = new Dir(this.endPos.y-this.startPos.y, this.endPos.x-this.startPos.x);
    this.drawArrowOnBoard(arrDir);
  }

  public getStartPos(): Pos {
    return this.startPos;
  }

  public getEndPos(): Pos {
    return this.endPos;
  }

  public removeHtml(): void {
    this.arrContainer.remove();
  }

  private drawArrowOnBoard(arrDir: Dir): void {
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
    const rotationDegOfVector = this.calcRotationDegOfVector(arrDir);

    this.arrContainer = this.createArrowContainerHtml(rotationDegOfVector, fieldWidth);
    const arrowHead = this.createArrowHeadHtml(arrTailLengthPx, fieldWidth);
    const arrowTail = this.createArrowTailHtml(arrTailLengthPx, fieldWidth);
  
    this.arrContainer.append(arrowTail);
    this.arrContainer.append(arrowHead);
    this.board.el[this.startPos.y][this.startPos.x].html.append(this.arrContainer);
  }

  private createArrowContainerHtml(rotationDegOfVector: number, fieldWidth: number): HTMLDivElement {
    const arrContainer = document.createElement("div");
    arrContainer.style.setProperty("--rotationDeg", `${-rotationDegOfVector}deg`);
    arrContainer.classList.add(CLASS_NAMES.arrowContainer);
    arrContainer.style.width = `${fieldWidth * 0.8}px`;
    arrContainer.style.height = `${fieldWidth * 0.8}px`;
    return arrContainer;
  }

  private createArrowHeadHtml(arrTailLengthPx: number, fieldWidth: number): HTMLDivElement {
    const arrowHead = document.createElement("div");
    arrowHead.style.setProperty("--headHeight", `${fieldWidth/2 + arrTailLengthPx}px`);
    arrowHead.classList.add(CLASS_NAMES.arrowHead);
    arrowHead.style.width = `${fieldWidth}px`;
    arrowHead.style.height = `${fieldWidth}px`;
    return arrowHead;
  }

  private createArrowTailHtml(arrTailLengthPx: number, fieldWidth: number): HTMLDivElement {
    const arrowTail = document.createElement("div");
    arrowTail.style.setProperty("--halfOfFieldSize", `${fieldWidth/2}px`);
    arrowTail.classList.add(CLASS_NAMES.arrowTail);
    arrowTail.style.width = `${arrTailLengthPx + 1}px`;
    arrowTail.style.height = `${fieldWidth * 0.3}px`;
    return arrowTail;
  }

  private calcRotationDegOfVector(vecDir: Dir): number {
    const fromRadtoDegMultiplier = 180 / Math.PI;
    const rotationAngleDeg = Math.atan(Math.abs(vecDir.y)/Math.abs(vecDir.x)) * fromRadtoDegMultiplier;

    const verticallyOrHorizontally = this.calcRotationDegVerticallyOrHorizontally(vecDir);
    if (verticallyOrHorizontally !== null) {
      return verticallyOrHorizontally;
    }

    const quadrantNum = this.calcQuadrantNum(vecDir);
    return this.rotationDegDiagonally(rotationAngleDeg, quadrantNum);
  }

  private calcRotationDegVerticallyOrHorizontally(dir: Dir): (null | 0 | 90 | 180 | 270) {
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

  private calcQuadrantNum(aDir: Dir): (1 | 2 | 3 | 4) {
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

  private rotationDegDiagonally(rotationAngleDeg: number, quadrantNum: (1|2|3|4)): number {
    switch (quadrantNum) {
      case 1: return rotationAngleDeg;
      case 2: return 180 - rotationAngleDeg;
      case 3: return 180 + rotationAngleDeg;
      case 4: return 360 - rotationAngleDeg;
    }
  }
}