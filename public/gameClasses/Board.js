import Pos from "./Pos";
import Field from "./Field";
import Piece from "./Pieces/Piece";
import Pawn from "./Pieces/Pawn";
import Rook from "./Pieces/Rook";
import Knight from "./Pieces/Knight";
import Bishop from "./Pieces/Bishop";
import Queen from "./Pieces/Queen";
import King from "./Pieces/King";
import Move from "./move";
import VisualizingArrowsArr from "./VisualizingArrowsArr";
import VisualizingArrow from "./VisualizingArrow";
import MapOfPiecesOnBoardAtStart from "./MapOfPiecesOnBoardAtStart";
export default class Board {
    constructor(htmlElQuerySelector, htmlPageContainerQuerySelector) {
        this.visualizationSystem = (ev) => {
            const rightClickNum = 2;
            if (ev.button !== rightClickNum) {
                return;
            }
            let mouseHold = new Promise((resolve, reject) => {
                this.html.addEventListener("mouseup", () => {
                    reject();
                }, { once: true });
                setTimeout(() => {
                    resolve();
                }, 150);
            });
            mouseHold.then(() => {
                this.html.addEventListener("mouseup", endEv => {
                    const startPos = this.getFieldCoorByPx(ev.clientX, ev.clientY);
                    const endPos = this.getFieldCoorByPx(endEv.clientX, endEv.clientY);
                    if (startPos.x === endPos.x && startPos.y === endPos.y) {
                        return;
                    }
                    const matchingArrowNum = this.visualizingArrows.getMatchingArrowNum(startPos, endPos);
                    if (matchingArrowNum !== -1) {
                        this.visualizingArrows.removeArrow(matchingArrowNum);
                        return;
                    }
                    this.visualizingArrows.arr.push(new VisualizingArrow(this, startPos, endPos));
                }, { once: true });
            }).catch(() => {
                this.toggleHighlightOnFieldOnPos(this.getFieldCoorByPx(ev.clientX, ev.clientY));
            });
        };
        this.currTeam = 1;
        this.moves = [];
        this.el = [];
        this.html = document.querySelector(htmlElQuerySelector);
        this.htmlPageContainer = document.querySelector(htmlPageContainerQuerySelector);
        this.fieldsInOneRow = 8;
        this.grabbedPiece = null;
        this.visualizingArrows = new VisualizingArrowsArr();
        this.pawnPromotionMenu = null;
        this.mapOfPiecesOnBoardAtStart = new MapOfPiecesOnBoardAtStart(true);
        this.pawnNum = 1;
        this.rookNum = 2;
        this.knightNum = 3;
        this.bishopNum = 4;
        this.queenNum = 5;
        this.kingNum = 6;
        this.whiteNum = 1;
        this.blackNum = 2;
        const root = document.querySelector(":root");
        root.style.setProperty("--fieldSize", `${this.html.offsetWidth / this.fieldsInOneRow}px`);
        this.createContainersForFieldsAndPieces();
        this.createFields();
        this.placePiecesAtStart();
        this.kings = this.getKings();
        this.html.addEventListener("mousedown", this.visualizationSystem);
    }
    createContainersForFieldsAndPieces() {
        this.fieldsHtml = document.createElement("div");
        this.fieldsHtml.classList.add("boardFieldsContainer");
        this.fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
        this.html.append(this.fieldsHtml);
        this.piecesHtml = document.createElement("div");
        this.piecesHtml.classList.add("boardPiecesContainer");
        this.piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
        this.html.append(this.piecesHtml);
    }
    getProperPieceByString(pieceString) {
        // if( pieceString==="empty" ) {
        //   return this.getNewPieceObj(-1, -1);
        // }
        // const pieceNum = ( () => {
        //   switch(pieceString.slice(1, pieceString.length-1)) {
        //     case "Pawn": return pawnNum;
        //     case "Rook": return rookNum;
        //     case "Knight": return knightNum;
        //     case "Bishop": return bishopNum;
        //     case "Queen": return queenNum;
        //     case "King": return kingNum;
        //   }
        // }) ();
        // const teamNum = pieceString[0]==="w" ? whiteNum : blackNum;
        // return this.getNewPieceObj(pieceNum, teamNum);
        return this.getNewPieceObj(0, null);
    }
    getNewPieceObj(num, team) {
        switch (num) {
            case this.pawnNum: return new Pawn(team, this.getNewHtmlPiece(num, team, "piece"), this);
            case this.rookNum: return new Rook(team, this.getNewHtmlPiece(num, team, "piece"), this);
            case this.knightNum: return new Knight(team, this.getNewHtmlPiece(num, team, "piece"), this);
            case this.bishopNum: return new Bishop(team, this.getNewHtmlPiece(num, team, "piece"), this);
            case this.queenNum: return new Queen(team, this.getNewHtmlPiece(num, team, "piece"), this);
            case this.kingNum: return new King(team, this.getNewHtmlPiece(num, team, "piece"), this);
            default: return new Piece(null, null, this);
        }
    }
    getNewHtmlPiece(num, team, cssClass) {
        let piece = document.createElement("div");
        piece.classList.add(cssClass);
        piece.style.backgroundImage = `url(../images/${this.getPieceNameByNum(num, team)}.png)`;
        return piece;
    }
    getPieceNumByPos(pos) {
        const begRookPos = [new Pos(0, 0), new Pos(0, 7)];
        for (let i = 0; i < begRookPos.length; i++) {
            if ((begRookPos[i].y === pos.y && begRookPos[i].x === pos.x) ||
                (this.fieldsInOneRow - 1 - begRookPos[i].y === pos.y && begRookPos[i].x === pos.x)) {
                return this.rookNum;
            }
        }
        const begKnightPos = [new Pos(0, 1), new Pos(0, 6)];
        for (let i = 0; i < begKnightPos.length; i++) {
            if ((begKnightPos[i].y === pos.y && begKnightPos[i].x === pos.x) ||
                (this.fieldsInOneRow - 1 - begKnightPos[i].y === pos.y && begKnightPos[i].x === pos.x)) {
                return this.knightNum;
            }
        }
        const begBishopPos = [new Pos(0, 2), new Pos(0, 5)];
        for (let i = 0; i < begBishopPos.length; i++) {
            if ((begBishopPos[i].y === pos.y && begBishopPos[i].x === pos.x) ||
                (this.fieldsInOneRow - 1 - begBishopPos[i].y === pos.y && begBishopPos[i].x === pos.x)) {
                return this.bishopNum;
            }
        }
        const begQueenPos = new Pos(0, 3);
        if ((begQueenPos.y === pos.y && begQueenPos.x === pos.x) ||
            (this.fieldsInOneRow - 1 - begQueenPos.y === pos.y && begQueenPos.x === pos.x)) {
            return this.queenNum;
        }
        const begKingPos = new Pos(0, 4);
        if ((begKingPos.y === pos.y && begKingPos.x === pos.x) ||
            (this.fieldsInOneRow - 1 - begKingPos.y === pos.y && begKingPos.x === pos.x)) {
            return this.kingNum;
        }
        return this.pawnNum;
    }
    createFields() {
        this.el = [];
        let fieldNr = 0;
        for (let r = 0; r < this.fieldsInOneRow; r++) {
            this.el[r] = [];
            for (let c = 0; c < this.fieldsInOneRow; c++) {
                if (c !== 0) {
                    fieldNr = (fieldNr === 0) ? 1 : 0;
                }
                let field = document.createElement("div");
                field.classList.add(`field`);
                field.classList.add(`field${fieldNr}`);
                this.fieldsHtml.append(field);
                this.el[r][c] = new Field(field, null);
                if (this.el[r][c].piece.num === this.kingNum) {
                    this.el[r][c].piece.pos = new Pos(r, c);
                }
                if (this.el[r][c].piece.html) {
                    this.piecesHtml.append(this.el[r][c].piece.html);
                    this.el[r][c].piece.html.style.transform =
                        `translate(
              ${c * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px, 
              ${r * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
            )`;
                }
            }
        }
    }
    placePiecesAtStart() {
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                this.el[r][c].piece = this.getProperPieceByString(this.mapOfPiecesOnBoardAtStart.map[r][c]);
            }
        }
    }
    getFieldCoorByPx(leftPx, topPx) {
        const boardStartLeft = (this.htmlPageContainer.offsetWidth - this.html.offsetWidth) / 2;
        const boardStartTop = (this.htmlPageContainer.offsetHeight - this.html.offsetHeight) / 2;
        const posOnBoardLeft = leftPx - boardStartLeft;
        const posOnBoardTop = topPx - boardStartTop;
        let fieldC = Math.ceil(posOnBoardLeft / this.html.offsetWidth * this.fieldsInOneRow) - 1;
        let fieldR = Math.ceil(posOnBoardTop / this.html.offsetHeight * this.fieldsInOneRow) - 1;
        if (fieldC < 0 || fieldC + 1 > this.fieldsInOneRow) {
            fieldC = -1;
        }
        if (fieldR < 0 || fieldR + 1 > this.fieldsInOneRow) {
            fieldR = -1;
        }
        return new Pos(fieldR, fieldC);
    }
    highlightFieldUnderMovingPiece(pos) {
        if (document.getElementById("fieldHighlightedUnderMovingPiece")) {
            document.getElementById("fieldHighlightedUnderMovingPiece").id = "";
        }
        if (pos.y !== -1 && pos.x !== -1) {
            this.el[pos.y][pos.x].html.id = "fieldHighlightedUnderMovingPiece";
        }
    }
    toggleHighlightOnFieldOnPos(pos) {
        this.el[pos.y][pos.x].html.classList.toggle("highlighted");
    }
    turnOfHighlightOnAllFields() {
        const fields = document.getElementsByClassName("highlighted");
        for (let i = 0; i < fields.length; i++) {
            fields[i].classList.remove("highlighted");
            i--;
        }
    }
    getPieceNameByNum(pieceNum, pieceTeam) {
        let name;
        switch (pieceNum) {
            case this.pawnNum:
                name = "pawn";
                break;
            case this.rookNum:
                name = "rook";
                break;
            case this.knightNum:
                name = "knight";
                break;
            case this.bishopNum:
                name = "bishop";
                break;
            case this.queenNum:
                name = "queen";
                break;
            case this.kingNum:
                name = "king";
                break;
        }
        let teamChar = (pieceTeam === this.blackNum) ? "B" : "W";
        return name + teamChar;
    }
    placePieceInPos(pos, piece, appendHtml) {
        if (appendHtml) {
            this.piecesHtml.append(piece.html);
        }
        if (piece.html) {
            piece.html.
                addEventListener("mousedown", piece.startFollowingCursor, { once: true });
        }
        piece.pos = (piece.num === this.kingNum) ? new Pos(pos.y, pos.x) : null;
        piece.html.style.transform =
            `translate(
      ${pos.x * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px, 
      ${pos.y * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
    )`;
        this.el[pos.y][pos.x].piece = piece;
    }
    movePiece(from, to, piece) {
        if (this.el[to.y][to.x].piece.html !== null) {
            this.removePieceInPos(to, true);
        }
        if (this.el[from.y][from.x].piece.num) {
            this.el[from.y][from.x].piece = new Piece(0, null, null);
        }
        this.moves.push(new Move(piece, from, to));
        this.currTeam = (this.currTeam === this.whiteNum) ? this.blackNum : this.whiteNum;
        this.turnOfHighlightOnAllFields();
        this.visualizingArrows.removeAllArrows();
        this.placePieceInPos(to, piece);
    }
    getEmptyFieldsPosAtBeginning() {
        let fieldsPos = [];
        for (let r = 2; r < 6; r++) {
            for (let c = 0; c < this.fieldsInOneRow; c++) {
                fieldsPos.push(new Pos(r, c));
            }
        }
        return fieldsPos;
    }
    removePieceInPos(pos, html) {
        if (html) {
            this.el[pos.y][pos.x].piece.html.remove();
        }
        this.el[pos.y][pos.x].piece = this.getNewPieceObj(0, null);
    }
    getKings() {
        let kings = {
            white: null,
            black: null
        };
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                if (this.el[r][c].piece.num === this.kingNum) {
                    switch (this.el[r][c].piece.team) {
                        case this.whiteNum:
                            kings.white = this.el[r][c].piece;
                            break;
                        case this.blackNum:
                            kings.black = this.el[r][c].piece;
                            break;
                    }
                }
                if (kings.white && kings.black) {
                    return kings;
                }
            }
        }
        return kings;
    }
    showPossibleMoves(possMoves, enemyTeamNum) {
        const root = document.querySelector(":root");
        root.style.setProperty("--possMoveSize", `${this.html.offsetWidth / this.fieldsInOneRow / 3}px`);
        for (let i = 0; i < possMoves.length; i++) {
            const move = possMoves[i];
            const div = document.createElement("div");
            div.classList.add("possMove");
            if (this.el[possMoves[i].y][possMoves[i].x].piece.team === enemyTeamNum) {
                div.classList.add("possMoveTake");
            }
            div.dataset.possMove = "";
            this.el[move.y][move.x].html.append(div);
        }
    }
    hidePossibleMoves() {
        document.querySelectorAll("[data-poss-move]").forEach(move => {
            move.remove();
        });
    }
}
