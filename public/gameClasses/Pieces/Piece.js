import Dir from "../Dir.js";
export default class Piece {
    constructor(team, html, board) {
        this.startFollowingCursor = (ev) => {
            const leftClickNum = 0;
            const fieldCoor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
            if (this.board.currTeam !== this.team || ev.button !== leftClickNum || this.board.pawnPromotionMenu || this.board.grabbedPiece !== null) {
                this.html.addEventListener("mousedown", this.startFollowingCursor, { once: true });
                return;
            }
            this.possMoves = this.getPossibleMovesFromPos(fieldCoor);
            this.board.showPossibleMoves(this.possMoves, this.enemyTeamNum());
            let mouseHold = new Promise((resolve, reject) => {
                this.html.addEventListener("mouseup", () => {
                    reject();
                }, { once: true });
                setTimeout(() => {
                    resolve();
                }, 150);
            });
            this.board.grabbedPiece = this;
            this.board.grabbedPiece.pos = fieldCoor;
            this.board.removePieceInPos(fieldCoor);
            this.html.id = "move";
            this.moveToCursor(ev);
            document.addEventListener("mousemove", this.moveToCursor);
            mouseHold.then(() => {
                setTimeout(() => {
                    document.addEventListener("mouseup", this.stopFollowingCursor, { once: true });
                });
            }).catch(() => {
                setTimeout(() => {
                    document.addEventListener("click", this.stopFollowingCursor, { once: true });
                });
            });
        };
        this.moveToCursor = (ev) => {
            const cursorPosOnBoard = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
            if (cursorPosOnBoard.x === -1 || cursorPosOnBoard.y === -1) {
                return;
            }
            this.board.highlightFieldUnderMovingPiece(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));
            this.html.style.transform =
                `translate(
        ${ev.clientX - ((this.board.htmlPageContainer.offsetWidth - this.board.piecesHtml.offsetWidth) / 2) - this.html.offsetWidth / 2}px, 
        ${ev.clientY - ((this.board.htmlPageContainer.offsetHeight - this.board.piecesHtml.offsetHeight) / 2) - this.html.offsetWidth / 2}px
      )`;
        };
        this.stopFollowingCursor = (ev) => {
            this.html.id = "";
            if (document.getElementById("fieldHighlightedUnderMovingPiece")) {
                document.getElementById("fieldHighlightedUnderMovingPiece").id = "";
            }
            document.removeEventListener("mousemove", this.moveToCursor);
            this.board.hidePossibleMoves();
            const newPos = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
            const oldPos = this.board.grabbedPiece.pos;
            for (let i = 0; i < this.possMoves.length; i++) {
                if (this.possMoves[i].x === newPos.x && this.possMoves[i].y === newPos.y &&
                    (newPos.x !== this.board.grabbedPiece.pos.x || newPos.y !== this.board.grabbedPiece.pos.y)) {
                    this.board.movePiece(oldPos, // from
                    newPos, // to
                    this.board.grabbedPiece // moving piece
                    );
                    this.board.grabbedPiece.sideEffectsOfMove(newPos, oldPos);
                    this.possMoves = [];
                    this.board.grabbedPiece = null;
                    return;
                }
            }
            this.board.placePieceInPos(this.board.grabbedPiece.pos, this.board.grabbedPiece);
            this.possMoves = [];
            this.board.grabbedPiece = null;
        };
        this.num = 0;
        this.team = team;
        this.html = html;
        this.board = board;
        this.pos = null;
        this.possMoves = [];
        if (this.html !== null) {
            this.html.addEventListener("mousedown", this.startFollowingCursor, { once: true });
        }
    }
    enemyTeamNum() {
        return (this.team === this.board.whiteNum) ? this.board.blackNum : this.board.whiteNum;
    }
    getPossibleMovesFromPosForKing(pos) {
        let possibleMoves = [];
        return possibleMoves;
    }
    getPossibleMovesFromPos(pos) {
        let possibleMoves = [];
        return possibleMoves;
    }
    substraktAbsPinsFromPossMoves(possMoves, absPins, pos) {
        for (let p = 0; p < absPins.length; p++) {
            if (absPins[p].pinnedPiecePos.x === pos.x && absPins[p].pinnedPiecePos.y === pos.y) {
                for (let m = 0; m < possMoves.length; m++) {
                    const simplifyXAndY = (this.num === this.board.knightNum) ? false : true; // simplify means make 1 if >1 and -1 if <-1
                    const moveDir = new Dir(possMoves[m].y - pos.y, possMoves[m].x - pos.x, simplifyXAndY);
                    if ((moveDir.x === 0 && moveDir.y === 0) ||
                        (moveDir.x === absPins[p].pinDir.x && moveDir.y === absPins[p].pinDir.y) ||
                        (moveDir.x * -1 === absPins[p].pinDir.x && moveDir.y * -1 === absPins[p].pinDir.y)) {
                        continue;
                    }
                    possMoves.splice(m, 1);
                    m--;
                }
            }
        }
        return possMoves;
    }
    sideEffectsOfMove(to, from) {
    }
}
