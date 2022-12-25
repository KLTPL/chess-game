import { mouseHold } from "../app.js";
import Board from "./Board.js";
import Pos from "./Pos.js";
import VisualizingArrow from "./VisualizingArrow.js";

const HIGHLIGHT_FIELD_CLASS_NAME = "highlighted-field";

export default class VisualizingSystem {
  arrows: VisualizingArrow[] = [];
  constructor(private board: Board) {
    this.board.html.addEventListener("mousedown", this.handleMouseDown);
  }

  private handleMouseDown = (ev: MouseEvent): void => {
    if (ev.button === 0) { // mouse left click
      this.removeAllArrows();
      this.removeHighlightFromAllFields();
      return;
    }
    if (ev.button !== 2) { // mouse right click
      return;
    }

    mouseHold(this.board.html)
    .then(() => {
      this.board.html.addEventListener("mouseup", endEv => {
        const startPos = this.board.calcFieldCoorByPx(ev.clientX, ev.clientY);
        const endPos = this.board.calcFieldCoorByPx(endEv.clientX, endEv.clientY);
        if (
          startPos.x === endPos.x && 
          startPos.y === endPos.y
        ) {
          this.toggleHighlightOnFieldOnPos(this.board.calcFieldCoorByPx(ev.clientX, ev.clientY));
          return;
        }
        const matchingArrowNum = this.indexOfEqualArrow(startPos, endPos);
        if (matchingArrowNum !== null) {
          this.removeArrow(matchingArrowNum);
          return;
        }
        this.arrows.push(new VisualizingArrow(this.board, startPos, endPos));
      }, {once: true});
    }).catch( () => {
      this.toggleHighlightOnFieldOnPos(this.board.calcFieldCoorByPx(ev.clientX, ev.clientY));
    });
  }

  private indexOfEqualArrow(startPos: Pos, endPos: Pos): (number|null) {
    for( let i=0 ; i<this.arrows.length ; i++ ) {
      const arrSPos = this.arrows[i].getStartPos();
      const arrEPos = this.arrows[i].getEndPos();
      if( 
        startPos.x === arrSPos.x && startPos.y === arrSPos.y &&
        endPos  .x === arrEPos.x && endPos  .y === arrEPos.y
      ) {
        return i;
      }
    }
    return null;
  }

  private removeAllArrows(): void {
    while (this.arrows.length > 0) {
      this.removeArrow(0);
    }
  }

  private removeArrow(arrNum: number): void {
    this.arrows[arrNum].removeHtml();
    this.arrows.splice(arrNum, 1);
  }

  private toggleHighlightOnFieldOnPos(pos: Pos): void {
    this.board.el[pos.y][pos.x].html.classList.toggle(HIGHLIGHT_FIELD_CLASS_NAME);
  }

  private removeHighlightFromAllFields(): void {
    const fields = document.getElementsByClassName(HIGHLIGHT_FIELD_CLASS_NAME);
    for (let i=0 ; i<fields.length ; i++) {
      fields[i].classList.remove(HIGHLIGHT_FIELD_CLASS_NAME);
      i--;
    }
  }
}