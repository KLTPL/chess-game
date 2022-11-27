import Board from "./Board.js";
import Pos from "./Pos.js";
import Dir from "./Dir.js";

type ClassNames = {
  arrowContainer: string;
  arrowHead: string;
  arrowTail: string;
}

export default class VisualizingArrow {
  // arr = arrow ||  arr = arrows
  board: Board;
  startPos: Pos;
  endPos: Pos;
  arrContainer: HTMLDivElement;
  classNames: ClassNames;
  constructor(board: Board, startPos: Pos, endPos: Pos) {
    this.board = board;
    this.startPos = startPos;
    this.endPos = endPos;
    const arrDir = new Dir(this.endPos.y-this.startPos.y, this.endPos.x-this.startPos.x);
    this.arrContainer = document.createElement("div");
    this.classNames = {
      arrowContainer: "arrow-container",
      arrowHead: "arrow-head",
      arrowTail: "arrow-tail"
    }
    this.drawArrowOnBoard(arrDir);
  }

  drawArrowOnBoard(arrDir: Dir) {
    const arrLengthFields = 
      Math.sqrt(
        Math.abs(
          Math.pow(Math.abs(arrDir.x), 2) + Math.pow(Math.abs(arrDir.y), 2)
        )
      );
    const fieldWidth = this.board.html.offsetWidth / this.board.fieldsInOneRow;
    const arrLengthPx = arrLengthFields * fieldWidth;
    const arrHeadLengthPx = fieldWidth / 2;
    const arrTailLengthPx = arrLengthPx - arrHeadLengthPx;

    const rotationDegOfVector = this.getRotationDegOfVector(arrDir);
    this.arrContainer.style.setProperty("--rotationDeg", `${-rotationDegOfVector}deg`);
    this.arrContainer.classList.add(this.classNames.arrowContainer);
    this.arrContainer.style.width = `${fieldWidth * 0.8}px`;
    this.arrContainer.style.height = `${fieldWidth * 0.8}px`;

    const arrowHead = document.createElement("div");
    arrowHead.style.setProperty("--headHeight", `${fieldWidth/2 + arrTailLengthPx}px`);
    arrowHead.classList.add(this.classNames.arrowHead);
    arrowHead.style.width = `${fieldWidth}px`;
    arrowHead.style.height = `${fieldWidth}px`;

    const arrowTail = document.createElement("div");
    arrowTail.style.setProperty("--halfOfFieldSize", `${fieldWidth/2}px`);
    arrowTail.classList.add(this.classNames.arrowTail);
    arrowTail.style.width = `${arrTailLengthPx + 1}px`;
    arrowTail.style.height = `${fieldWidth * 0.3}px`;
  
    this.arrContainer.append(arrowTail);
    this.arrContainer.append(arrowHead);
    this.board.el[this.startPos.y][this.startPos.x].html.append(this.arrContainer);
  }

  getRotationDegOfVector(vecDir: Dir) {
    const fromRadtoDegMultiplier = 180 / Math.PI;
    const rotationAngleDeg = Math.atan(Math.abs(vecDir.y)/Math.abs(vecDir.x)) * fromRadtoDegMultiplier;

    if (vecDir.y === 0) {
      if (vecDir.simplifyDir(vecDir.x) === 1) {
        return 0;
      } else { // dir.simplifyDir(dir.x) === -1
        return 180;
      }
    }

    if (vecDir.x===0) {
      if (vecDir.simplifyDir(-vecDir.y) === 1) {
        return 90;
      } else { // dir.simplifyDir(-dir.y) === -1
        return 270;
      }
    }

    const quadrantNum = ( () => {
      const simDir = new Dir( //simeplified direction
        vecDir.simplifyDir(vecDir.y), 
        vecDir.simplifyDir(vecDir.x)
      ); 
      if(simDir.x === 1) {
        if(simDir.y === -1) {
          return 1;
        } // simDir.y === 1
        return 4;  
      }
      // simDir.x === -1
      if(simDir.y === -1) {
        return 2;
      }
      return 3;
      
    }) ();
    
    switch (quadrantNum) {
      case 1: return rotationAngleDeg;
      case 2: return 180 - rotationAngleDeg;
      case 3: return 180 + rotationAngleDeg;
      case 4: return 360 - rotationAngleDeg;
    }
  }
}