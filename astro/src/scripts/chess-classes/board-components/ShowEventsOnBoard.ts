import Piece, { TEAMS } from "../pieces/Piece";
import Pos from "../Pos";
import Board, { FIELDS_IN_ONE_ROW } from "./Board";
import { CLASS_NAMES as CLASS_NAMES_FIELD } from "./Field";

export default class ShowEvetsOnBoard {
  public moveClassification: Pos | null = null;
  constructor(private board: Board) {}

  public toggleCssGrabOnPieces(): void {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        this.board.el[r][c].piece?.toggleCssGrab();
      }
    }
  }

  public turnOfCssGrabOnPieces(): void {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        this.board.el[r][c].piece?.removeCssGrab();
      }
    }
  }

  public showFieldUnderMovingPiece(pos: Pos): void {
    this.stopShowingFieldUnderMovingPiece();
    if (!Board.isPosIn(pos)) {
      return;
    }
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldUnderMovingPiece);
    this.board.el[pos.y][pos.x].html.append(div);
  }

  public stopShowingFieldUnderMovingPiece() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldUnderMovingPiece}`);
  }

  public showFieldPieceWasSelectedFrom(pos: Pos): void {
    this.stopShowingFieldPieceWasSelectedFrom();
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldPieceWasSelectedFrom);
    this.board.el[pos.y][pos.x].html.append(div);
  }

  public stopShowingFieldPieceWasSelectedFrom() {
    this.stopShowingHighlight(
      `.${CLASS_NAMES_FIELD.fieldPieceWasSelectedFrom}`
    );
  }

  public showPossibleMoves(
    possMovesToShow: Pos[],
    enemyTeamNum: number,
    from: Pos
  ): void {
    for (const possMove of possMovesToShow) {
      const div = document.createElement("div");
      const isMoveCapture =
        this.board.el[possMove.y][possMove.x].piece?.team === enemyTeamNum ||
        (Piece.isPawn(this.board.el[from.y][from.x].piece) && // en passant
          from.x !== possMove.x);
      div.classList.add(
        CLASS_NAMES_FIELD.possMove,
        isMoveCapture
          ? CLASS_NAMES_FIELD.possMoveCapture
          : CLASS_NAMES_FIELD.possMovePlain
      );

      this.board.el[possMove.y][possMove.x].html.append(div);
    }
  }

  public stopShowingPossibleMoves(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.possMove}`);
  }

  public stopShowingCheck() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldInCheck}`);
  }

  public showCheck(kingPos: Pos): void {
    // king pos as argument instead of this.pos because of the ability to go back in time and temporarly see what happened
    this.stopShowingCheck();
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldInCheck);
    this.board.el[kingPos.y][kingPos.x].html.append(div);
  }

  public showCheckIfKingIsInCheck(kingTeam: TEAMS): void {
    // field becomes red if in check
    const king = this.board.getKingByTeam(kingTeam);
    this.stopShowingCheck();
    if (king.isInCheck()) {
      this.showCheck(king.pos.getInvertedProperly(this.board.isInverted));
    }
  }

  public showNewMoveClassification(pos: Pos): void {
    this.stopShowingMoveClassification();
    const rand = Math.floor(Math.random() * 20);
    switch (
      rand // both 5% chance
    ) {
      case 0:
        this.showBrilliantMove(pos);
        break;
      case 1:
        this.showBlunderMove(pos);
        break;
    }
  }

  private showBrilliantMove(pos: Pos): void {
    const div = document.createElement("div");
    div.classList.add(
      CLASS_NAMES_FIELD.fieldMoveClassification,
      CLASS_NAMES_FIELD.fieldBrilliant
    );
    this.board.el[pos.y][pos.x].html.append(div);
    this.moveClassification = new Pos(pos.y, pos.x);
  }

  private showBlunderMove(pos: Pos): void {
    const div = document.createElement("div");
    div.classList.add(
      CLASS_NAMES_FIELD.fieldMoveClassification,
      CLASS_NAMES_FIELD.fieldBlunder
    );
    this.board.el[pos.y][pos.x].html.append(div);
    this.moveClassification = new Pos(pos.y, pos.x);
  }

  public stopShowingMoveClassification(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldBrilliant}`);
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldBlunder}`);
    this.moveClassification = null;
  }

  public showNewRowAndColUserIsTouching(touch: Pos): void {
    this.stopShowingRowAndColUserIsTouching();
    if (Board.isPosIn(touch)) {
      this.showRowAndColUserIsTouching(touch);
    }
  }

  public showRowAndColUserIsTouching(touch: Pos): void {
    const createHighlight = (): HTMLDivElement => {
      const highlight = document.createElement("div");
      highlight.classList.add(CLASS_NAMES_FIELD.fieldRowAndColHighlight);
      return highlight;
    };
    for (let i = 0; i < FIELDS_IN_ONE_ROW; i++) {
      this.board.el[i][touch.x].html.append(createHighlight());
      this.board.el[touch.y][i].html.append(createHighlight());
    }
  }

  public stopShowingRowAndColUserIsTouching(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldRowAndColHighlight}`);
  }

  public showNewLastMove(from: Pos, to: Pos): void {
    this.stopShowingLastMove();
    this.showLastMove(from, to);
  }

  private showLastMove(from: Pos, to: Pos): void {
    const toShow = [from, to];
    for (const pos of toShow) {
      const lastMove = document.createElement("div");
      lastMove.classList.add(CLASS_NAMES_FIELD.fieldLastMove);
      this.board.el[pos.y][pos.x].html.append(lastMove);
    }
  }

  public stopShowingLastMove(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldLastMove}`);
  }

  private stopShowingHighlight(querySelectorAll: string): void {
    this.board.html.querySelectorAll(querySelectorAll).forEach((el) => {
      el.remove();
    });
  }

  public invertEvents(): void {
    const board = this.board;
    if (
      board.movesSystem.isThereAtLeastOneHalfMove() &&
      !board.analisisSystem.isUserAnalisingMove0()
    ) {
      const currHalfMove =
        board.movesSystem.halfmoves[
          board.analisisSystem.getIndexOfHalfmoveUserIsOn()
        ];
      if (currHalfMove.isCheck()) {
        this.invertCheck(currHalfMove.posOfKingChecked as Pos);
      }
      this.invertLastMove(currHalfMove.from, currHalfMove.to);
    }

    if (this.moveClassification !== null) {
      this.invertMoveClassification();
    }
  }

  private invertCheck(posOfKing: Pos): void {
    this.showCheck(posOfKing.getInvertedProperly(this.board.isInverted));
  }

  private invertLastMove(from: Pos, to: Pos): void {
    this.showNewLastMove(
      from.getInvertedProperly(this.board.isInverted),
      to.getInvertedProperly(this.board.isInverted)
    );
  }
  private invertMoveClassification(): void {
    const div = document.querySelector(
      `.${CLASS_NAMES_FIELD.fieldMoveClassification}`
    ) as HTMLDivElement;
    div.remove();
    const pos = (this.moveClassification as Pos).getInvertedProperly(
      this.board.isInverted
    );
    this.board.el[pos.y][pos.x].html.append(div);
  }
}
