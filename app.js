var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Pos = /** @class */ (function () {
    function Pos(posR, posC) {
        this.x = posC;
        this.y = posR;
    }
    return Pos;
}());
var Field = /** @class */ (function () {
    function Field(html, piece) {
        this.html = html;
        this.piece = piece;
    }
    return Field;
}());
var Piece = /** @class */ (function () {
    function Piece(team, html) {
        this.team = team;
        this.html = html;
    }
    return Piece;
}());
var GrabbedPiece = /** @class */ (function (_super) {
    __extends(GrabbedPiece, _super);
    function GrabbedPiece(team, html, num, begPos) {
        var _this = _super.call(this, team, html) || this;
        _this.num = num;
        _this.begPos = begPos;
        return _this;
    }
    return GrabbedPiece;
}(Piece));
var Pawn = /** @class */ (function (_super) {
    __extends(Pawn, _super);
    function Pawn(team, html) {
        var _this = _super.call(this, team, html) || this;
        _this.num = 1;
        _this.value = 1;
        _this.haventMoved = true;
        _this.anotherPawnPassed = null;
        return _this;
    }
    Pawn.prototype.getPossibleMovesFromPos = function (pos) {
        return [new Pos(pos.y + 1, pos.x), new Pos(pos.y + 2, pos.x)];
    };
    return Pawn;
}(Piece));
var Rook = /** @class */ (function (_super) {
    __extends(Rook, _super);
    function Rook(team, html) {
        var _this = _super.call(this, team, html) || this;
        _this.num = 2;
        _this.value = 5;
        return _this;
    }
    Rook.prototype.getPossibleMovesFromPos = function (pos) {
        return [new Pos(pos.y + 1, pos.x), new Pos(pos.y + 2, pos.x)];
    };
    return Rook;
}(Piece));
var Knight = /** @class */ (function (_super) {
    __extends(Knight, _super);
    function Knight(team, html) {
        var _this = _super.call(this, team, html) || this;
        _this.num = 3;
        _this.value = 3;
        _this.haventMoved = true;
        return _this;
    }
    Knight.prototype.getPossibleMovesFromPos = function (pos) {
        return [new Pos(pos.y + 1, pos.x), new Pos(pos.y + 2, pos.x)];
    };
    return Knight;
}(Piece));
var Bishop = /** @class */ (function (_super) {
    __extends(Bishop, _super);
    function Bishop(team, html) {
        var _this = _super.call(this, team, html) || this;
        _this.num = 4;
        _this.value = 3;
        return _this;
    }
    Bishop.prototype.getPossibleMovesFromPos = function (pos) {
        return [new Pos(pos.y + 1, pos.x), new Pos(pos.y + 2, pos.x)];
    };
    return Bishop;
}(Piece));
var Queen = /** @class */ (function (_super) {
    __extends(Queen, _super);
    function Queen(team, html) {
        var _this = _super.call(this, team, html) || this;
        _this.num = 5;
        _this.value = 9;
        return _this;
    }
    Queen.prototype.getPossibleMovesFromPos = function (pos) {
        return [new Pos(pos.y + 1, pos.x), new Pos(pos.y + 2, pos.x)];
    };
    return Queen;
}(Piece));
var King = /** @class */ (function (_super) {
    __extends(King, _super);
    function King(team, html) {
        var _this = _super.call(this, team, html) || this;
        _this.num = 6;
        return _this;
    }
    King.prototype.getPossibleMovesFromPos = function (pos) {
        return [new Pos(pos.y + 1, pos.x), new Pos(pos.y + 2, pos.x)];
    };
    return King;
}(Piece));
var Board = /** @class */ (function () {
    function Board(htmlElQuerySelector, htmlPageContainerQuerySelector) {
        var _this = this;
        this.startFollowingCursor = function (e) {
            var mauseHold = new Promise(function (resolve, reject) {
                var pieceHtml = board.el[_this.getFieldCoorByPx(e.clientX, e.clientY).y][_this.getFieldCoorByPx(e.clientX, e.clientY).x]
                    .piece.html;
                pieceHtml.addEventListener("mouseup", function () {
                    reject();
                });
                setTimeout(function () {
                    resolve();
                }, 150);
            });
            var grabbedPiece = board.el[_this.getFieldCoorByPx(e.clientX, e.clientY).y][_this.getFieldCoorByPx(e.clientX, e.clientY).x]
                .piece;
            _this.grabbedPiece =
                new GrabbedPiece(grabbedPiece.team, grabbedPiece.html, grabbedPiece.num, _this.getFieldCoorByPx(e.clientX, e.clientY));
            var evTarget = e.target;
            _this.removePieceInPos(_this.getFieldCoorByPx(e.clientX, e.clientY));
            evTarget.id = "move";
            evTarget.style.cursor = "grabbing";
            _this.htmlPageContainer.append(evTarget);
            var move = document.getElementById("move");
            move.style.transform = "translate(".concat((e.clientX - move.offsetWidth / 2), "px,").concat((e.clientY - move.offsetHeight / 2), "px)");
            var fieldCoor = _this.getFieldCoorByPx(e.clientX, e.clientY);
            _this.el[fieldCoor.y][fieldCoor.x].html.id = "fieldHighlighted";
            move.addEventListener("mousemove", _this.moveToCursor);
            mauseHold.then(function () {
                move.addEventListener("mouseup", _this.stopFollowingCursor, { once: true });
            })["catch"](function () {
                move.addEventListener("click", _this.stopFollowingCursor, { once: true });
            });
        };
        this.moveToCursor = function (e) {
            _this.highlightHtmlField(_this.getFieldCoorByPx(e.clientX, e.clientY));
            var move = document.getElementById("move");
            move.style.transform = "translate(".concat((e.clientX - move.offsetWidth / 2), "px, ").concat((e.clientY - move.offsetHeight / 2), "px)");
        };
        this.stopFollowingCursor = function (e) {
            var move = document.getElementById("move");
            move.id = "";
            if (Boolean(document.getElementById("fieldHighlighted"))) {
                document.getElementById("fieldHighlighted").id = "";
            }
            move.removeEventListener("mousemove", _this.moveToCursor);
            _this.placePieceInPos(_this.getFieldCoorByPx(e.clientX, e.clientY), _this.grabbedPiece.num, _this.grabbedPiece.team, _this.grabbedPiece.begPos);
            move.remove();
            _this.grabbedPiece = null;
        };
        this.el = [];
        this.html = document.querySelector(htmlElQuerySelector);
        this.htmlPageContainer = document.querySelector(htmlPageContainerQuerySelector);
        this.fieldsInOneRow = 8;
        var root = document.querySelector(":root");
        root.style.setProperty("--fieldSize", "".concat(this.html.offsetWidth / this.fieldsInOneRow, "px"));
        this.createFields();
    }
    Board.prototype.getProperPieceByDeafultPosition = function (row, col) {
        var emptyFiledsAtBeginning = this.getEmptyFieldsAtBeginning();
        for (var i = 0; i < emptyFiledsAtBeginning.length; i++) {
            if (emptyFiledsAtBeginning[i].y === row && emptyFiledsAtBeginning[i].x === col) {
                return this.getNewPieceObj(0, null);
            }
        }
        var pieceNum = this.getPieceNumByPos(row, col);
        var team = (row < 4) ? 2 : 1;
        return this.getNewPieceObj(pieceNum, team);
    };
    Board.prototype.getNewPieceObj = function (num, team) {
        switch (num) {
            case 1: return new Pawn(team, this.getNewHtmlPiece(num, team));
            case 2: return new Rook(team, this.getNewHtmlPiece(num, team));
            case 3: return new Knight(team, this.getNewHtmlPiece(num, team));
            case 4: return new Bishop(team, this.getNewHtmlPiece(num, team));
            case 5: return new Queen(team, this.getNewHtmlPiece(num, team));
            case 6: return new King(team, this.getNewHtmlPiece(num, team));
            default: return new Piece(null, null);
        }
    };
    Board.prototype.getNewHtmlPiece = function (num, team) {
        var piece = document.createElement("div");
        piece.classList.add("piece");
        piece.style.backgroundImage = "url(./images/".concat(this.getPieceNameByNum(num, team), ".png)");
        piece.addEventListener("mousedown", this.startFollowingCursor, { once: true });
        return piece;
    };
    Board.prototype.getEmptyFieldsAtBeginning = function () {
        var fields = [];
        for (var r = 2; r < 6; r++) {
            for (var c = 0; c < this.fieldsInOneRow; c++) {
                fields.push(new Pos(r, c));
            }
        }
        return fields;
    };
    Board.prototype.getPieceNumByPos = function (row, col) {
        var begRookPos = [new Pos(0, 0), new Pos(0, 7)];
        for (var i = 0; i < begRookPos.length; i++) {
            if ((begRookPos[i].y === row && begRookPos[i].x === col) ||
                (this.fieldsInOneRow - 1 - begRookPos[i].y === row && begRookPos[i].x === col)) {
                return 2;
            }
        }
        var begKnightPos = [new Pos(0, 1), new Pos(0, 6)];
        for (var i = 0; i < begKnightPos.length; i++) {
            if ((begKnightPos[i].y === row && begKnightPos[i].x === col) ||
                (this.fieldsInOneRow - 1 - begKnightPos[i].y === row && begKnightPos[i].x === col)) {
                return 3;
            }
        }
        var begBishopPos = [new Pos(0, 2), new Pos(0, 5)];
        for (var i = 0; i < begBishopPos.length; i++) {
            if ((begBishopPos[i].y === row && begBishopPos[i].x === col) ||
                (this.fieldsInOneRow - 1 - begBishopPos[i].y === row && begBishopPos[i].x === col)) {
                return 4;
            }
        }
        var begQueenPos = new Pos(0, 3);
        if ((begQueenPos.y === row && begQueenPos.x === col) ||
            (this.fieldsInOneRow - 1 - begQueenPos.y === row && begQueenPos.x === col)) {
            return 5;
        }
        var begKingPos = new Pos(0, 4);
        if ((begKingPos.y === row && begKingPos.x === col) ||
            (this.fieldsInOneRow - 1 - begKingPos.y === row && begKingPos.x === col)) {
            return 6;
        }
        return 1;
    };
    Board.prototype.createFields = function () {
        this.el = [];
        var fieldNr = 0;
        for (var r = 0; r < this.fieldsInOneRow; r++) {
            this.el[r] = [];
            for (var c = 0; c < this.fieldsInOneRow; c++) {
                if (c !== 0) {
                    fieldNr = (fieldNr === 0) ? 1 : 0;
                }
                var el = document.createElement("div");
                el.classList.add("field");
                el.classList.add("field".concat(fieldNr));
                this.html.append(el);
                this.el[r][c] = new Field(el, this.getProperPieceByDeafultPosition(r, c));
                if (Boolean(this.el[r][c].piece.html)) {
                    this.el[r][c].html.append(this.el[r][c].piece.html);
                }
            }
        }
    };
    Board.prototype.getFieldCoorByPx = function (leftPx, topPx) {
        var boardStartLeft = (this.htmlPageContainer.offsetWidth - this.html.offsetWidth) / 2;
        var boardStartTop = (this.htmlPageContainer.offsetHeight - this.html.offsetHeight) / 2;
        var posOnBoardLeft = leftPx - boardStartLeft;
        var posOnBoardTop = topPx - boardStartTop;
        var fieldC = Math.ceil(posOnBoardLeft / this.html.offsetWidth * this.fieldsInOneRow) - 1;
        var fieldR = Math.ceil(posOnBoardTop / this.html.offsetHeight * this.fieldsInOneRow) - 1;
        if (fieldC < 0 || fieldC + 1 > this.fieldsInOneRow) {
            fieldC = -1;
        }
        if (fieldR < 0 || fieldR + 1 > this.fieldsInOneRow) {
            fieldR = -1;
        }
        return new Pos(fieldR, fieldC);
    };
    Board.prototype.highlightHtmlField = function (pos) {
        if (Boolean(document.getElementById("fieldHighlighted"))) {
            document.getElementById("fieldHighlighted").id = "";
        }
        if (pos.y !== -1 && pos.x !== -1) {
            this.el[pos.y][pos.x].html.id = "fieldHighlighted";
        }
    };
    Board.prototype.getPieceNameByNum = function (pieceNum, pieceTeam) {
        var name;
        switch (pieceNum) {
            case 1:
                name = "pawn";
                break;
            case 2:
                name = "rook";
                break;
            case 3:
                name = "knight";
                break;
            case 4:
                name = "bishop";
                break;
            case 5:
                name = "queen";
                break;
            case 6:
                name = "king";
                break;
        }
        var teamChar = (pieceTeam === 2) ? "B" : "W";
        return name + teamChar;
    };
    Board.prototype.placePieceInPos = function (pos, pieceNum, pieceTeam, altPos) {
        var newPos = (pos.x === -1 || pos.y === -1) ? altPos : pos;
        if (this.el[newPos.y][newPos.x].piece.html !== null) {
            this.removePieceInPos(newPos);
        }
        var newPiece = this.getNewPieceObj(pieceNum, pieceTeam);
        this.el[newPos.y][newPos.x].piece = newPiece;
        this.el[newPos.y][newPos.x].html.append(newPiece.html);
    };
    Board.prototype.removePieceInPos = function (pos) {
        this.el[pos.y][pos.x].piece.html.remove();
        this.el[pos.y][pos.x].piece = this.getNewPieceObj(0, null);
    };
    return Board;
}());
var board = new Board("[data-board-container]", "[data-container]");
