import Piece from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import Check from "../Check.js";
function getRandomColor() {
    switch (Math.floor(Math.random() * 9)) {
        case 0: return "red";
        case 1: return "blue";
        case 2: return "green";
        case 3: return "yellow";
        case 4: return "black";
        case 5: return "pink";
        case 6: return "orange";
        case 6: return "brown";
        case 7: return "purple";
        case 8: return "gray";
    }
}
export default class King extends Piece {
    constructor(team, html, board) {
        super(team, html, board);
        this.num = 6;
        this.value = 0;
        this.haventMovedYet = true;
        this.checks = [];
    }
    getPossibleMovesFromPosForKing(pos) {
        let possibleMoves = [];
        let directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        for (let dir of directions) {
            const newPos = new Pos(pos.y + dir.y, pos.x + dir.x);
            if (this.board.posIsInBoard(newPos)) {
                possibleMoves.push(newPos);
            }
        }
        ;
        return possibleMoves;
    }
    getPossibleMovesFromPos(pos) {
        const enemyTeamNum = this.enemyTeamNum();
        let possibleMoves = [pos];
        let directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        const possibleCastlesDir = this.getPossibleCastlesDir();
        const possibleCastlesPos = (() => {
            let possitions = [];
            for (let castDir of possibleCastlesDir) {
                possitions.push(new Pos(pos.y + castDir.y, pos.x + castDir.x));
            }
            return possitions;
        })();
        possibleMoves.push(...possibleCastlesPos);
        for (let dir of directions) {
            const newPos = new Pos(pos.y + dir.y, pos.x + dir.x);
            if (this.board.posIsInBoard(newPos) &&
                this.board.el[pos.y + dir.y][pos.x + dir.x].piece.team !== this.team) {
                possibleMoves.push(newPos);
            }
        }
        ;
        for (let r = 0; r < this.board.el.length; r++) {
            for (let c = 0; c < this.board.el[r].length; c++) {
                if (this.board.el[r][c].piece.team !== enemyTeamNum) {
                    continue;
                }
                const enemyPiecePossMoves = this.board.el[r][c].piece.getPossibleMovesFromPosForKing(new Pos(r, c));
                for (let e = 0; e < enemyPiecePossMoves.length; e++) {
                    for (let m = 1; m < possibleMoves.length; m++) { // m=1 becouse possibleMoves[0] is kings pos
                        if (enemyPiecePossMoves[e].x === possibleMoves[m].x && enemyPiecePossMoves[e].y === possibleMoves[m].y &&
                            (enemyPiecePossMoves[e].x !== c || enemyPiecePossMoves[e].y !== r)) {
                            possibleMoves.splice(m, 1);
                            m--;
                        }
                    }
                }
                ;
            }
            ;
        }
        return possibleMoves;
    }
    getPossibleCastlesDir() {
        if (!this.haventMovedYet) {
            return [];
        }
        let castlesDir = [new Dir(0, 2), new Dir(0, -2)];
        for (let i = 0; i < castlesDir.length; i++) {
            const currentRookXPos = (castlesDir[i].simplifyDir(castlesDir[i].x) === 1) ? this.board.fieldsInOneRow - 1 : 0;
            const currentRook = this.board.el[this.pos.y][currentRookXPos].piece;
            if (!this.board.posIsInBoard(new Pos(this.pos.y, this.pos.x + castlesDir[i].x)) ||
                this.board.el[this.pos.y][this.pos.x + (castlesDir[i].x / 2)].piece.num ||
                this.board.el[this.pos.y][this.pos.x + castlesDir[i].x].piece.num ||
                this.somePieceHasCheckOnWayOfCastle(new Pos(this.pos.y, this.pos.x + (castlesDir[i].x / 2))) ||
                this.somePieceHasCheckOnWayOfCastle(new Pos(this.pos.y, this.pos.x + castlesDir[i].x)) ||
                !currentRook.haventMovedYet) {
                castlesDir.splice(i, 1);
                i--;
            }
        }
        return castlesDir;
    }
    somePieceHasCheckOnWayOfCastle(pos) {
        const enemyTeamNum = this.enemyTeamNum();
        for (let r = 0; r < this.board.el.length; r++) {
            for (let c = 0; c < this.board.el[r].length; c++) {
                if (this.board.el[r][c].piece.team !== enemyTeamNum ||
                    this.board.el[r][c].piece.num === this.board.kingNum) {
                    continue;
                }
                if (this.board.el[r][c].piece.num !== this.board.pawnNum) {
                    const possMoves = this.board.el[r][c].piece.getPossibleMovesFromPos(new Pos(r, c));
                    for (let move of possMoves) {
                        if (move.x === pos.x && move.y === pos.y) {
                            return true;
                        }
                    }
                    continue;
                }
            }
        }
        return false;
    }
    getPossitionsOfAbsolutePins(kingPosition) {
        const kingPos = (() => {
            if (kingPosition) {
                return kingPosition;
            }
            return (this.team === this.board.whiteNum) ? this.board.kings.white.pos : this.board.kings.black.pos;
        })();
        let absPins = [];
        let directions = [
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1),
            new Dir(1, 1), new Dir(-1, 1), new Dir(1, -1), new Dir(-1, -1)
        ];
        for (let d = 0; d < directions.length; d++) {
            const kingIsInlineVerticallyOrHorizontally = (directions[d].x === 0 || directions[d].y === 0);
            let tempPos = new Pos(kingPos.y, kingPos.x);
            let pinInThisDir;
            tempPos.x += directions[d].x;
            tempPos.y += directions[d].y;
            while (this.board.posIsInBoard(tempPos)) {
                if (this.board.el[tempPos.y][tempPos.x].piece.num) {
                    if (!pinInThisDir) {
                        if (this.board.el[tempPos.y][tempPos.x].piece.team !== this.team) {
                            break;
                        }
                        pinInThisDir = new Pin(new Pos(tempPos.y, tempPos.x), directions[d]);
                        tempPos.x += directions[d].x;
                        tempPos.y += directions[d].y;
                        continue;
                    }
                    if ((this.board.el[tempPos.y][tempPos.x].piece.num !== this.board.bishopNum &&
                        this.board.el[tempPos.y][tempPos.x].piece.num !== this.board.rookNum &&
                        this.board.el[tempPos.y][tempPos.x].piece.num !== this.board.queenNum) ||
                        this.board.el[tempPos.y][tempPos.x].piece.team === this.team) {
                        break;
                    }
                    if ((kingIsInlineVerticallyOrHorizontally &&
                        this.board.el[tempPos.y][tempPos.x].piece.num !== this.board.bishopNum)
                        ||
                            (!kingIsInlineVerticallyOrHorizontally &&
                                this.board.el[tempPos.y][tempPos.x].piece.num !== this.board.rookNum)) {
                        absPins.push(pinInThisDir);
                    }
                }
                tempPos.x += directions[d].x;
                tempPos.y += directions[d].y;
            }
        }
        return absPins;
    }
    sideEffectsOfMove(to, from) {
        if (this.haventMovedYet) {
            this.haventMovedYet = false;
        }
        // castle
        if (Math.abs(from.x - to.x) > 1) {
            const castleDir = new Dir(0, to.x - from.x, true);
            if (castleDir.x === 1) {
                const grabbedPiece = this.board.el[from.y][this.board.fieldsInOneRow - 1].piece;
                this.board.removePieceInPos(new Pos(from.y, this.board.fieldsInOneRow - 1));
                this.board.placePieceInPos(new Pos(to.y, to.x + (castleDir.x * -1)), grabbedPiece);
            }
            else {
                const grabbedPiece = this.board.el[from.y][0].piece;
                this.board.removePieceInPos(new Pos(from.y, this.board.fieldsInOneRow - 1));
                this.board.placePieceInPos(new Pos(to.y, to.x + (castleDir.x * -1)), grabbedPiece);
            }
        }
    }
    updateChecksArr() {
        this.checks = [];
        const possitionsOfPiecesCheckingKing = this.getPossitionsOfPiecesCheckingKing();
        for (let posOfPiece of possitionsOfPiecesCheckingKing) {
            this.checks.push(new Check(posOfPiece, this.pos, this.board));
        }
    }
    getPossitionsOfPiecesCheckingKing() {
        let checkingPieces = [];
        for (let r = 0; r < this.board.el.length; r++) {
            for (let c = 0; c < this.board.el[r].length; c++) {
                if (this.board.el[r][c].piece.team !== this.enemyTeamNum()) {
                    continue;
                }
                const pieceMovesForKing = this.board.el[r][c].piece.getPossibleMovesFromPosForKing(new Pos(r, c));
                for (let move of pieceMovesForKing) {
                    if (this.pos.x === move.x && this.pos.y === move.y) {
                        checkingPieces.push(new Pos(r, c));
                    }
                }
            }
        }
        return checkingPieces;
    }
}
