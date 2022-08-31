import Board from "./Board.js";
import Pos from "./Pos.js";
import VisualizingArrow from "./VisualizingArrow.js";

export default class VisualizingSystem {
  arrows: VisualizingArrow[];
  highlightClass: string;
  board: Board;
  constructor(board: Board) {
    this.arrows = [];
    this.highlightClass = "highlighted";
    this.board = board;
  }

  actionsOnMouseDown = (ev: MouseEvent) => {
    const leftClickNum = 0;
    const rightClickNum = 2;
    if( ev.button===leftClickNum ) {
      this.removeAllArrows();
      this.removeHighlightFromAllFields();
      return;
    }
    if( ev.button!==rightClickNum ) {
      return;
    }

    let mouseHold = new Promise<void>((resolve, reject) => {
      this.board.html.addEventListener(
        "mouseup", 
        () => {
          reject();
        }, 
        {once: true}
      );
      setTimeout(() => {
        resolve();
      }, 150);
    });
    mouseHold.then( () => {
      this.board.html.addEventListener("mouseup", endEv => {
        const startPos = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
        const endPos = this.board.getFieldCoorByPx(endEv.clientX, endEv.clientY);
        if( startPos.x===endPos.x && startPos.y===endPos.y ) {
          this.toggleHighlightOnFieldOnPos(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));
          return;
        }
        const matchingArrowNum = this.getMatchingArrowNum(startPos, endPos);
        if( matchingArrowNum!==-1 ) {
          this.removeArrow(matchingArrowNum);
          return;
        }
        this.arrows.push(new VisualizingArrow(this.board, startPos, endPos));
      },
      {once: true});
    }).catch( () => {
      this.toggleHighlightOnFieldOnPos(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));
    });
  }

  getMatchingArrowNum(startPos: Pos, endPos: Pos) {
    for( let i=0 ; i<this.arrows.length ; i++ ) {
      const arrSPos = this.arrows[i].startPos;
      const arrEPos = this.arrows[i].endPos;
      if( 
        startPos.x===arrSPos.x && startPos.y===arrSPos.y &&
        endPos  .x===arrEPos.x && endPos  .y===arrEPos.y
      ) {
        return i;
      }
    }
    return -1;
  }

  removeAllArrows() {
    while( this.arrows.length>0 ) {
      this.removeArrow(0);
    }
  }

  removeArrow(arrNum: number) {
    this.arrows[arrNum].arrContainer.remove();
    this.arrows.splice(arrNum, 1);
  }

  toggleHighlightOnFieldOnPos(pos: Pos) {
    this.board.el[pos.y][pos.x].html.classList.toggle(this.highlightClass);
  }

  removeHighlightFromAllFields() {
    const fields = document.getElementsByClassName(this.highlightClass);
    for( let i=0 ; i<fields.length ; i++ ) {
      fields[i].classList.remove(this.highlightClass);
      i--;
    }
  }
}