import Pos from "./Pos.js";
import Field from "./Field.js";
import Piece from "./Pieces/Piece.js";
import Pawn from "./Pieces/Pawn.js";
import Rook from "./Pieces/Rook.js";
import Knight from "./Pieces/Knight.js";
import Bishop from "./Pieces/Bishop.js";
import Queen from "./Pieces/Queen.js";
import King from "./Pieces/King.js";
import Move from "./Move.js";
import VisualizingSystem from "./VisualizingSystem.js";
export default class Board {
    constructor(htmlQSelector, htmlPageContainerQSelector, match, startPositionsOfPieces) {
        this.match = match;
        this.currTeam = 1;
        this.moves = [];
        this.el = [];
        this.html = document.querySelector(htmlQSelector);
        this.pageContainerHtml = document.querySelector(htmlPageContainerQSelector);
        this.fieldsInOneRow = 8;
        this.grabbedPiece = null;
        this.visualizingSystem = new VisualizingSystem(this);
        this.pawnPromotionMenu = null;
        this.noPieceNum = 0;
        this.pawnNum = 1;
        this.rookNum = 2;
        this.knightNum = 3;
        this.bishopNum = 4;
        this.queenNum = 5;
        this.kingNum = 6;
        this.noTeamNum = 0;
        this.whiteNum = 1;
        this.blackNum = 2;
        this.classNames = {
            field: "field",
            fieldColor1: "field1",
            fieldColor2: "field2",
            piece: "piece",
            possMove: "possMove",
            possMoveCapture: "possMoveCapture",
            possMoveStart: "possMoveStart",
            fieldsContainer: "boardFieldsContainer",
            piecesContainer: "boardPiecesContainer",
        };
        this.inverted = false;
        this.updateFieldSize();
        document.addEventListener("resize", this.updateFieldSize);
        this.createContainersForFieldsAndPieces();
        this.createFields();
        this.placePieces(startPositionsOfPieces);
        this.kings = this.getKings();
        if (this.inverted) {
            this.flipPerspective();
        }
        this.html.addEventListener("mousedown", this.visualizingSystem.actionsOnMouseDown);
    }
    createContainersForFieldsAndPieces() {
        this.fieldsHtml = document.createElement("div");
        this.fieldsHtml.classList.add(this.classNames.fieldsContainer);
        this.fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
        this.html.append(this.fieldsHtml);
        this.piecesHtml = document.createElement("div");
        this.piecesHtml.classList.add(this.classNames.piecesContainer);
        this.piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
        this.html.append(this.piecesHtml);
    }
    getNewPieceObj(num, team) {
        switch (num) {
            case this.pawnNum: return new Pawn(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
            case this.rookNum: return new Rook(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
            case this.knightNum: return new Knight(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
            case this.bishopNum: return new Bishop(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
            case this.queenNum: return new Queen(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
            case this.kingNum: return new King(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
            default: return new Piece(this.noTeamNum, null, this);
        }
    }
    getNewHtmlPiece(num, team, className) {
        let piece = document.createElement("div");
        piece.classList.add(className);
        piece.style.backgroundImage = `url(./images/${this.getPieceNameByNum(num, team)}.png)`;
        return piece;
    }
    createFields() {
        this.el = [];
        let fieldNr = 1;
        for (let r = 0; r < this.fieldsInOneRow; r++) {
            this.el[r] = [];
            for (let c = 0; c < this.fieldsInOneRow; c++) {
                if (c !== 0) {
                    fieldNr = (fieldNr === 1) ? 2 : 1;
                }
                let field = document.createElement("div");
                field.classList.add(this.classNames.field);
                field.classList.add(this.classNames[`fieldColor${fieldNr}`]);
                this.fieldsHtml.append(field);
                this.el[r][c] = new Field(field, this.getNewPieceObj(this.noPieceNum, this.noTeamNum));
                if (this.el[r][c].piece.num === this.kingNum) {
                    this.el[r][c].piece.pos = new Pos(r, c);
                }
                if (this.el[r][c].piece.html) {
                    this.piecesHtml.append(this.el[r][c].piece.html);
                    this.el[r][c].piece.html.style.transform =
                        `translateX(
              ${c * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
            )
            translateY(
              ${r * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
            )`;
                }
            }
        }
    }
    placePieces(customPositions) {
        const arrOfPiecesToPlaceByPieceNum = (customPositions) ?
            this.convertMapOfPiecesForHumanToMapForScript(customPositions) :
            this.getMapOfPiecesInDeafultPos();
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                this.placePieceInPos(new Pos(r, c), arrOfPiecesToPlaceByPieceNum[r][c], Boolean(arrOfPiecesToPlaceByPieceNum[r][c].html));
            }
        }
    }
    convertMapOfPiecesForHumanToMapForScript(customPositions) {
        let mapForScript = [];
        for (let r = 0; r < customPositions.length; r++) {
            mapForScript.push([]);
            for (let c = 0; c < customPositions[r].length; c++) {
                if (typeof customPositions[r][c] === "number") {
                    const multiplayer = customPositions[r][c];
                    const multiplayedPiece = customPositions[r][c + 1];
                    for (let i = 0; i < multiplayer; i++) {
                        mapForScript[r].push(this.getNewPieceObjByString(multiplayedPiece));
                    }
                    c++;
                    continue;
                }
                const multiplayedPiece = customPositions[r][c];
                mapForScript[r].push(this.getNewPieceObjByString(multiplayedPiece));
            }
        }
        return mapForScript;
    }
    getNewPieceObjByString(piece) {
        const pieceTeam = this.getPieceTeamByString(piece[0]);
        const pieceName = piece.slice(1, piece.length);
        return this.getNewPieceObj(this.getPieceNumByName(pieceName), pieceTeam);
    }
    getPieceTeamByString(team) {
        switch (team) {
            case "w": return this.whiteNum;
            case "b": return this.blackNum;
            default: return this.noTeamNum;
        }
    }
    getPieceNumByName(name) {
        switch (name) {
            case "pawn": return this.pawnNum;
            case "rook": return this.rookNum;
            case "knight": return this.knightNum;
            case "bishop": return this.bishopNum;
            case "queen": return this.queenNum;
            case "king": return this.kingNum;
            default: return this.noPieceNum;
        }
    }
    getMapOfPiecesInDeafultPos() {
        const firstAndLastRowNums = [
            this.rookNum, this.knightNum, this.bishopNum, this.queenNum, this.kingNum, this.bishopNum, this.knightNum, this.rookNum
        ];
        let mapOfPieces = [];
        for (let r = 0; r < this.fieldsInOneRow; r++) {
            mapOfPieces[r] = [];
            const teamNum = (r < 4) ? this.blackNum : this.whiteNum;
            if (r === 0 || r === this.fieldsInOneRow - 1) {
                for (let pieceNum of firstAndLastRowNums) {
                    mapOfPieces[r].push(this.getNewPieceObj(pieceNum, teamNum));
                }
                continue;
            }
            const pieceNum = (r === 1 || r === this.fieldsInOneRow - 2) ?
                this.pawnNum :
                this.noPieceNum;
            for (let i = 0; i < this.fieldsInOneRow; i++) {
                mapOfPieces[r].push(this.getNewPieceObj(pieceNum, (pieceNum === this.noPieceNum) ? this.noTeamNum : teamNum));
            }
        }
        return mapOfPieces;
    }
    invertMap(map) {
        let newMap = [];
        for (let r = map.length - 1; r >= 0; r--) {
            newMap[newMap.length] = [];
            for (let c = map[r].length - 1; c >= 0; c--) {
                newMap[newMap.length - 1].push(map[r][c]);
            }
        }
        return newMap;
    }
    getFieldCoorByPx(leftPx, topPx) {
        const boardStartLeft = (this.pageContainerHtml.offsetWidth - this.html.offsetWidth) / 2;
        const boardStartTop = (this.pageContainerHtml.offsetHeight - this.html.offsetHeight) / 2;
        const posOnBoardLeft = leftPx - boardStartLeft;
        const posOnBoardTop = topPx - boardStartTop;
        let fieldC = Math.ceil(posOnBoardLeft / this.html.offsetWidth * this.fieldsInOneRow) - 1;
        let fieldR = Math.ceil(posOnBoardTop / this.html.offsetHeight * this.fieldsInOneRow) - 1;
        if (fieldC < 0 || fieldC > this.fieldsInOneRow - 1) {
            fieldC = -1;
        }
        if (fieldR < 0 || fieldR > this.fieldsInOneRow - 1) {
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
            piece.html.style.transform =
                `translateX(
        ${pos.x * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
      )
      translateY(
        ${pos.y * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
      )`;
        }
        piece.pos = (piece.num === this.kingNum) ? new Pos(pos.y, pos.x) : null;
        this.el[pos.y][pos.x].piece = piece;
    }
    movePiece(from, to, piece) {
        const moveIsCapture = this.el[to.y][to.x].piece.html !== null;
        if (moveIsCapture) {
            this.removePieceInPos(to, true);
        }
        if (this.el[from.y][from.x].piece.num) {
            this.el[from.y][from.x].piece = new Piece(0, null, null);
        }
        const newMove = (this.inverted) ?
            new Move(piece, from.invert(this.fieldsInOneRow), to.invert(this.fieldsInOneRow), moveIsCapture) :
            new Move(piece, from, to, moveIsCapture);
        this.moves.push(newMove);
        this.currTeam = (this.currTeam === this.whiteNum) ? this.blackNum : this.whiteNum;
        this.placePieceInPos(to, piece);
        piece.sideEffectsOfMove(to, from);
        const movingPiecesKing = (piece.team === this.whiteNum) ? this.kings.black : this.kings.white;
        movingPiecesKing.updateChecksArr();
        this.match.checkIfGameShouldEndAfterMove(this.moves[this.moves.length - 1]);
        if (this.match.gameRunning) {
            if (this.pawnPromotionMenu) {
                this.pawnPromotionMenu.waitingForDecision.then(() => {
                    this.flipPerspective();
                });
            }
            else {
                this.flipPerspective();
            }
        }
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
        if (!kings.white || !kings.black) {
            throw "Not enough kings on the board";
        }
        return kings;
    }
    showPossibleMoves(possMoves, enemyTeamNum) {
        const root = document.querySelector(":root");
        root.style.setProperty("--possMoveSize", `${this.html.offsetWidth / this.fieldsInOneRow / 3}px`);
        for (let i = 0; i < possMoves.length; i++) {
            const move = possMoves[i];
            const div = document.createElement("div");
            div.classList.add(this.classNames.possMove);
            if (this.el[move.y][move.x].piece.team === enemyTeamNum) {
                div.classList.add(this.classNames.possMoveCapture);
            }
            if (i === 0) {
                div.classList.add(this.classNames.possMoveStart);
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
    flipPerspective() {
        const boardBefore = [];
        for (let r = 0; r < this.el.length; r++) {
            boardBefore[r] = [];
            for (let c = 0; c < this.el[r].length; c++) {
                boardBefore[r].push(this.el[r][c].piece);
            }
        }
        const boardAfter = this.invertMap(boardBefore);
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                if (boardAfter[r][c].num === this.pawnNum) {
                    const pawn = boardAfter[r][c];
                    pawn.directionY *= -1;
                }
                this.placePieceInPos(new Pos(r, c), boardAfter[r][c]);
            }
        }
        const king = (this.currTeam === this.whiteNum) ? this.kings.white : this.kings.black;
        for (let check of king.checks) {
            check.checkedKingPos = check.checkedKingPos.invert(this.fieldsInOneRow);
            check.checkingPiecePos = check.checkingPiecePos.invert(this.fieldsInOneRow);
            for (let i = 0; i < check.fieldsInBetweenPieceAndKing.length; i++) {
                check.fieldsInBetweenPieceAndKing[i] = check.fieldsInBetweenPieceAndKing[i].invert(this.fieldsInOneRow);
            }
        }
        this.inverted = (this.inverted) ? false : true;
    }
    insufficientMaterialThatLeadsToDraw() {
        const kingVsKing = this.onlyTwoKingsLeft();
        const kingAndBishopVsKing = this.onlyTwoKingsAndBishopLeft();
        const kingAndKnightVsKing = this.onlyTwoKingsAndKnightLeft();
        const kingAndBishopVsKingAndBishop = this.onlyTwoKingsAndTwoBishopsLeft(); // both bishops on the same color square
        return kingVsKing || kingAndBishopVsKing || kingAndKnightVsKing || kingAndBishopVsKingAndBishop;
    }
    onlyTwoKingsLeft() {
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                if (this.el[r][c].piece.num !== this.noPieceNum && this.el[r][c].piece.num !== this.kingNum) {
                    return false;
                }
            }
        }
        return true;
    }
    onlyTwoKingsAndBishopLeft() {
        let bishopCounter = 0;
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                if (this.el[r][c].piece.num === this.bishopNum) {
                    if (bishopCounter) {
                        return false;
                    }
                    bishopCounter++;
                    continue;
                }
                if (this.el[r][c].piece.num !== this.noPieceNum && this.el[r][c].piece.num !== this.kingNum) {
                    return false;
                }
            }
        }
        return true;
    }
    onlyTwoKingsAndKnightLeft() {
        let knightCounter = 0;
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                if (this.el[r][c].piece.num === this.knightNum) {
                    if (knightCounter) {
                        return false;
                    }
                    knightCounter++;
                    continue;
                }
                if (this.el[r][c].piece.num !== this.noPieceNum && this.el[r][c].piece.num !== this.kingNum) {
                    return false;
                }
            }
        }
        return true;
    }
    onlyTwoKingsAndTwoBishopsLeft() {
        let bishopsPos = [];
        for (let r = 0; r < this.el.length; r++) {
            for (let c = 0; c < this.el[r].length; c++) {
                if (this.el[r][c].piece.num === this.bishopNum) {
                    if (bishopsPos.length >= 2) {
                        return false;
                    }
                    bishopsPos.push(new Pos(r, c));
                    continue;
                }
                if (this.el[r][c].piece.num !== this.noPieceNum && this.el[r][c].piece.num !== this.kingNum) {
                    return false;
                }
            }
        }
        return this.twoEnemyBishopsOnTheSameColor(bishopsPos);
    }
    twoEnemyBishopsOnTheSameColor(bishopsPos) {
        const twoBishops = bishopsPos.length === 2;
        if (!twoBishops) {
            return false;
        }
        const bishop1 = this.el[bishopsPos[0].y][bishopsPos[0].x].piece;
        const bishop2 = this.el[bishopsPos[1].y][bishopsPos[1].x].piece;
        const twoEnemyBishops = bishop1.team !== bishop2.team;
        const twoBishopsOntheSameColor = this.positionsOnTheSameColor(bishopsPos[0], bishopsPos[1]);
        return twoEnemyBishops && twoBishopsOntheSameColor;
    }
    positionsOnTheSameColor(pos1, pos2) {
        const pos1OnWhiteSquere = this.hasClass(this.el[pos1.y][pos1.x].html, this.classNames.fieldColor1);
        const pos2OnWhiteSquere = this.hasClass(this.el[pos2.y][pos2.x].html, this.classNames.fieldColor1);
        return pos1OnWhiteSquere === pos2OnWhiteSquere;
    }
    hasClass(element, className) {
        return element.className.includes(className);
    }
    noCapturesOrPawnMovesIn50Moves() {
        if (this.moves.length < 50) {
            return false;
        }
        for (let i = this.moves.length - 1; i > this.moves.length - 1 - 50; i--) {
            if (this.moves[i].capture || this.moves[i].piece.num === this.pawnNum) {
                return false;
            }
        }
        return true;
    }
    threeMovesRepetition() {
        if (this.moves.length < 6) {
            return false;
        }
        const lastMoveNum = this.moves.length - 1;
        const players1Moves = [this.moves[lastMoveNum], this.moves[lastMoveNum - 2], this.moves[lastMoveNum - 4]];
        const players2Moves = [this.moves[lastMoveNum - 1], this.moves[lastMoveNum - 3], this.moves[lastMoveNum - 5]];
        return (this.positionsMatch(players1Moves[0].from, players1Moves[1].to) &&
            this.positionsMatch(players1Moves[1].from, players1Moves[2].to) &&
            this.positionsMatch(players2Moves[0].from, players2Moves[1].to) &&
            this.positionsMatch(players2Moves[1].from, players2Moves[2].to));
    }
    posIsInBoard(pos) {
        return pos.x >= 0 && pos.x <= this.fieldsInOneRow - 1 && pos.y >= 0 && pos.y <= this.fieldsInOneRow - 1;
    }
    positionsMatch(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    updateFieldSize() {
        const root = document.querySelector(":root");
        root.style.setProperty("--fieldSize", `${this.html.offsetWidth / this.fieldsInOneRow}px`);
    }
}
