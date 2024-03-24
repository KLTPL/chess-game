import PieceModel from "../../pieces/model/PieceModel";
import PieceView from "../../pieces/view/PieceView";
import BoardModel from "../model/BoardModel";
import type Pos from "../model/Pos";
import type BoardView from "./BoardView";

const ID_SELECTED_PIECE_MOUSE = "move-mouse";
const ID_SELECTED_PIECE_TOUCH = "move-touch";
export const HOLD_MOUSE_TIME_MS = 150;
const HOLD_TOUCH_TIME_MS = 125;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT = 30;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE = 0;

export const hold = (
  element: HTMLElement,
  rejectEventType: string,
  timeMs: number
) => {
  return new Promise<void>((resolve, reject) => {
    element.addEventListener(
      rejectEventType,
      () => {
        reject();
      },
      { once: true }
    );
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
};

type SelectedPieceData = {
  piece: PieceView;
  grabbedFrom: Pos;
  possMoves: Pos[];
  isHold: boolean | null; // null if not set yet
} | null;

export default class DragAndDropPieces {
  private selectedPieceData: SelectedPieceData = null;
  constructor(private boardView: BoardView) {
    this.startListeningForClicks();
  }
  private startListeningForClicks(): void {
    window.addEventListener("mousedown", (ev) => this.handleEventStart(ev));
    window.addEventListener("mouseup", (ev) => this.handleEventEnd(ev));
    window.addEventListener("touchstart", (ev) => this.handleEventStart(ev));
    window.addEventListener("touchend", (ev) => this.handleEventEnd(ev));
    window.addEventListener("mousemove", (ev) => this.handleMouseMove(ev));
    window.addEventListener("touchmove", (ev) => this.hanldeTouchMove(ev));
  }

  private isEventValid(ev: MouseEvent | TouchEvent, pos: Pos): boolean {
    const isMouse = DragAndDropPieces.isEventMouseEvent(ev);
    const m = this.boardView.match;
    if (
      !BoardModel.isPosInBounds(pos) ||
      !m.isGameRunning ||
      this.boardView.pawnPromotionMenu !== null ||
      this.boardView.match.analisisSystem.isUserAnalising()
    ) {
      return false;
    }
    if (isMouse) {
      const leftClickNum = 0;
      if (ev.button !== leftClickNum) {
        return false;
      }
    } else {
      const touch = ev.changedTouches[0];
      if (touch.identifier > 0) {
        return false;
      }
    }
    return true;
  }
  private handleEventStart(ev: MouseEvent | TouchEvent) {
    const c = this.boardView.match;
    const isMouse = DragAndDropPieces.isEventMouseEvent(ev);
    const pos = this.getPosByEv(ev);
    if (!this.isEventValid(ev, pos)) {
      if (this.selectedPieceData !== null) {
        this.stopFollowing(ev);
      }
      return;
    }
    if (this.selectedPieceData !== null) {
      this.stopFollowing(ev);
      return;
    }
    if (
      !c.boardModel.isPosOccupied(pos) ||
      c.getTeamOfUserToMove(c.getCurrTeam()) !==
        c.boardModel.getPiece(pos)?.team
    ) {
      return;
    }
    const possMoves = c.getPossMovesFromPos(pos);
    const team = c.getPieceTeamAtPos(pos);
    const pieceView = this.boardView.getField(pos).getPiece();
    if (pieceView === null) {
      throw new Error(
        `There is no piece (PieceView) at provided position (x = ${pos.x}, y = ${pos.y})`
      );
    }
    this.boardView.showEventsOnBoard.showFieldPieceWasSelectedFrom(pos);
    this.boardView.showEventsOnBoard.showPossibleMoves(
      possMoves.filter((move) => !move.isEqualTo(pos)),
      PieceModel.getEnemyTeam(team),
      pos
    );
    this.selectedPieceData = {
      piece: pieceView,
      grabbedFrom: pos,
      possMoves,
      isHold: null,
    };

    if (isMouse) {
      this.startFollowingMouse(ev, pieceView);
    } else {
      this.startFollowingTouch(ev, pieceView);
    }
  }

  private startFollowingMouse(ev: MouseEvent, pieceView: PieceView): void {
    pieceView.setHTMLId(ID_SELECTED_PIECE_MOUSE);
    this.handleMouseMove(ev);
    hold(window.document.body, "mouseup", HOLD_MOUSE_TIME_MS)
      .then(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = true;
        }
      })
      .catch(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = false;
        }
      });
  }
  private startFollowingTouch(ev: TouchEvent, pieceView: PieceView): void {
    hold(window.document.body, "touchend", HOLD_TOUCH_TIME_MS)
      .then(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = true;
          pieceView.setHTMLId(ID_SELECTED_PIECE_TOUCH);
          this.hanldeTouchMove(ev);
        }
      })
      .catch(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = false;
        }
      });
  }
  private handleEventEnd(ev: MouseEvent | TouchEvent) {
    if (
      this.selectedPieceData !== null &&
      this.selectedPieceData.isHold === true
    ) {
      this.stopFollowing(ev);
    }
  }
  private async stopFollowing(ev: MouseEvent | TouchEvent) {
    if (this.selectedPieceData === null) {
      throw new Error(
        "Can not stop following becouse selected piece data is null"
      );
    }
    const s = this.selectedPieceData;
    s.piece.setHTMLId(""); // remove the ID_SELECTED_PIECE_MOUSE
    this.boardView.showEventsOnBoard.stopShowingFieldPieceWasSelectedFrom();
    this.boardView.showEventsOnBoard.stopShowingFieldUnderMovingPiece();
    this.boardView.showEventsOnBoard.stopShowingPossibleMoves();
    const newPos = this.getPosByEv(ev);
    const oldPos = s.grabbedFrom;
    for (const possMove of s.possMoves) {
      if (possMove.isEqualTo(newPos) && !newPos.isEqualTo(oldPos)) {
        this.selectedPieceData = null;
        await this.boardView.match.movePiece(oldPos, newPos);
        return;
      }
    }
    this.boardView.placePieceInPos(
      oldPos,
      s.piece,
      this.calcTransitionDelay(oldPos, newPos),
      false
    );
    this.selectedPieceData = null;
  }

  private handleMouseMove(ev: MouseEvent): void {
    if (this.selectedPieceData === null) {
      return;
    }
    const pos = this.boardView.calcFieldPosByPx(ev.clientX, ev.clientY);
    this.boardView.showEventsOnBoard.showFieldUnderMovingPiece(pos);
    this.selectedPieceData.piece.moveHTMLToPointer(
      ev.clientX,
      ev.clientY,
      this.boardView
    );
  }

  private hanldeTouchMove(ev: TouchEvent): void {
    if (this.selectedPieceData === null) {
      return;
    }
    const pos = this.boardView.calcFieldPosByPx(
      ev.changedTouches[0].clientX,
      ev.changedTouches[0].clientY
    );
    this.boardView.showEventsOnBoard.showFieldUnderMovingPiece(pos);
    // this.boardView.showEventsOnBoard.showNewRowAndColUserIsTouching(
    //   this.boardView.calcFieldPosByPx(
    //     ev.changedTouches[0].clientX,
    //     ev.changedTouches[0].clientY
    //   )
    // );
    this.selectedPieceData.piece.moveHTMLToPointer(
      ev.changedTouches[0].clientX,
      ev.changedTouches[0].clientY,
      this.boardView
    );
  }

  private calcTransitionDelay(oldPos: Pos, newPos: Pos): number {
    const distanceX = Math.abs(newPos.x - oldPos.x);
    const distanceY = Math.abs(newPos.y - oldPos.y);
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    return distance * CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT * 0.666;
  }

  public getPosByEv(ev: MouseEvent | TouchEvent) {
    const isMouse = DragAndDropPieces.isEventMouseEvent(ev);
    const pos = isMouse
      ? this.boardView.calcFieldPosByPx(ev.clientX, ev.clientY)
      : this.boardView.calcFieldPosByPx(
          ev.changedTouches[0].clientX,
          ev.changedTouches[0].clientY
        );
    return pos;
  }

  public getSelectedPieceData() {
    return this.selectedPieceData;
  }

  public static isEventMouseEvent(
    ev: MouseEvent | TouchEvent
  ): ev is MouseEvent {
    return ev.type.includes("mouse");
  }

  /*


  public stopListeningForClicks(): void {
    this.html.removeEventListener("mousedown", this.startFollowingCursorMouse);
  }

  private stopFollowingCursorMouse = async (
    ev: MouseEvent,
    possMoves: Pos[]
  ): Promise<void> => {
    const type = ev.type as "mouseup" | "mousedown";
    if (ev.button !== 0) {
      // 0 = left click
      document.addEventListener(
        type,
        (newEv) => this.stopFollowingCursorMouse(newEv, possMoves),
        { once: true }
      );
      return;
    }

    const boardGrabbedPieceInfo = this.boardView
      .selectedPieceInfo as SelectedPieceInfo; // .piece is equal to this
    document.removeEventListener("mousemove", this.handleMouseMove);
    this.html.id = ""; // remove the ID_SELECTED_PIECE_MOUSE
    this.boardView.showEventsOnBoard.stopShowingFieldPieceWasSelectedFrom();
    this.boardView.showEventsOnBoard.stopShowingFieldUnderMovingPiece();
    this.boardView.showEventsOnBoard.stopShowingPossibleMoves();
    const newPos = this.boardView.calcFieldPosByPx(ev.clientX, ev.clientY);
    const oldPos = boardGrabbedPieceInfo.grabbedFrom;
    for (const possMove of possMoves) {
      if (possMove.isEqualTo(newPos) && !newPos.isEqualTo(oldPos)) {
        await this.boardView.movePiece(
          oldPos,
          newPos,
          boardGrabbedPieceInfo.piece as AnyPiece,
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
        );
        this.boardView.selectedPieceInfo = null;
        return;
      }
    }
    this.boardView.placePieceInPos(
      oldPos,
      boardGrabbedPieceInfo.piece as AnyPiece,
      this.calcTransitionDelay(oldPos, newPos),
      false
    );
    this.boardView.selectedPieceInfo = null;
  };

  private stopFollowingCursorTouch = async (
    ev: TouchEvent,
    possMoves: Pos[]
  ): Promise<void> => {
    const touch = ev.changedTouches[0];
    const selectedPieceInfo = this.boardView
      .selectedPieceInfo as SelectedPieceInfo; // .piece is equal to this
    this.html.id = ""; // remove the ID_SELECTED_PIECE_TOUCH
    this.html.removeEventListener("touchmove", this.hanldeTouchMove);
    this.boardView.showEventsOnBoard.stopShowingFieldPieceWasSelectedFrom();
    this.boardView.showEventsOnBoard.stopShowingFieldUnderMovingPiece();
    this.boardView.showEventsOnBoard.stopShowingPossibleMoves();
    this.boardView.showEventsOnBoard.stopShowingRowAndColUserIsTouching();
    const newPos = this.boardView.calcFieldPosByPx(
      touch.clientX,
      touch.clientY
    );
    const oldPos = selectedPieceInfo.grabbedFrom;
    for (const possMove of possMoves) {
      if (possMove.isEqualTo(newPos) && !newPos.isEqualTo(oldPos)) {
        await this.boardView.movePiece(
          oldPos,
          newPos,
          selectedPieceInfo.piece as AnyPiece,
          CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT
        );
        this.boardView.selectedPieceInfo = null;
        return;
      }
    }
    this.boardView.placePieceInPos(
      oldPos,
      selectedPieceInfo.piece as AnyPiece,
      this.calcTransitionDelay(oldPos, newPos),
      false
    );
    this.boardView.selectedPieceInfo = null;
  };

    private startFollowingCursorMouse = (ev: MouseEvent): void => {
    // TODO
    const leftClickNum = 0;
    const fieldCoor = this.boardModel.findPosOfPiece(this);
    const possMoves = this.createArrOfPossibleMovesFromPos(fieldCoor);
    this.boardView.showEventsOnBoard.showFieldPieceWasSelectedFrom(fieldCoor);
    this.boardView.showEventsOnBoard.showPossibleMoves(
      possMoves.filter((move) => !move.isEqualTo(fieldCoor)),
      this.enemyTeamNum,
      fieldCoor
    );
    this.boardView.selectedPieceInfo = { piece: this, grabbedFrom: fieldCoor }; // TODO this Piece | AnyPiece
    this.boardView.removePieceInPos(fieldCoor, false);
    this.html.id = ID_SELECTED_PIECE_MOUSE;
    this.moveToPointer(ev.clientX, ev.clientY);
    document.addEventListener("mousemove", this.handleMouseMove);

    hold(this.html, "mouseup", HOLD_MOUSE_TIME_MS)
      .then(() => {
        document.addEventListener(
          "mouseup",
          (newEv) => this.stopFollowingCursorMouse(newEv, possMoves),
          { once: true }
        );
      })
      .catch(() => {
        document.addEventListener(
          "mousedown",
          (newEv) => this.stopFollowingCursorMouse(newEv, possMoves),
          { once: true }
        );
      });
  };

  private startFollowingCursorTouch = (ev: TouchEvent): void => {
    ev.preventDefault(); // prevents this.startFollowingCursorMouse from executing
    const touch = ev.changedTouches[0];
    const fieldCoor = this.boardView.findPosOfPiece(this);
    if (
      !this.boardView.match.isGameRunning ||
      this.boardView.currTeam !== this.team ||
      this.boardView.pawnPromotionMenu !== null ||
      this.boardView.selectedPieceInfo !== null ||
      this.boardView.analisisSystem.isUserAnalising() ||
      touch.identifier > 0 ||
      fieldCoor === null
    ) {
      return;
    }
    const possMoves = this.createArrOfPossibleMovesFromPos(fieldCoor);
    this.boardView.removePieceInPos(fieldCoor, false);
    this.boardView.selectedPieceInfo = { piece: this, grabbedFrom: fieldCoor }; // TODO this Piece | AnyPiece
    this.boardView.showEventsOnBoard.showFieldPieceWasSelectedFrom(fieldCoor);
    this.boardView.showEventsOnBoard.showPossibleMoves(
      possMoves.filter((move) => !move.isEqualTo(fieldCoor)),
      this.enemyTeamNum,
      fieldCoor
    );

    hold(this.html, "touchend", HOLD_TOUCH_TIME_MS)
      .then(() => {
        this.boardView.removePieceInPos(fieldCoor, false);
        this.html.id = ID_SELECTED_PIECE_TOUCH;
        this.boardView.showEventsOnBoard.showRowAndColUserIsTouching(fieldCoor);

        this.moveToPointer(touch.clientX, touch.clientY);
        this.html.addEventListener("touchmove", this.hanldeTouchMove);
        document.addEventListener(
          "touchend",
          (newEv) => this.stopFollowingCursorTouch(newEv, possMoves),
          { once: true }
        );
      })
      .catch(() => {
        document.addEventListener(
          "touchstart",
          (newEv) => this.stopFollowingCursorTouch(newEv, possMoves),
          { once: true }
        );
      });
  };
  */
}
