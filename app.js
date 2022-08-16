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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var moves = [];
var currTeam = 1;
var board;
var pawnNum = 1;
var rookNum = 2;
var knightNum = 3;
var bishopNum = 4;
var queenNum = 5;
var kingNum = 6;
var whiteNum = 1;
var blackNum = 2;
var Pos = /** @class */ (function () {
    function Pos(y, x) {
        this.y = y;
        this.x = x;
    }
    return Pos;
}());
var Dir = /** @class */ (function (_super) {
    __extends(Dir, _super);
    function Dir(y, x, simplifyXAndY) {
        var _this = _super.call(this, y, x) || this;
        if (simplifyXAndY) {
            _this.x = _this.simplifyXAndY(_this.x);
            _this.y = _this.simplifyXAndY(_this.y);
        }
        return _this;
    }
    Dir.prototype.simplifyXAndY = function (num) {
        if (num > 1) {
            return 1;
        }
        if (num < -1) {
            return -1;
        }
    };
    return Dir;
}(Pos));
var Pin = /** @class */ (function () {
    function Pin(pinnedPiecePos, pinDir) {
        this.pinnedPiecePos = pinnedPiecePos;
        this.pinDir = pinDir;
    }
    return Pin;
}());
var Field = /** @class */ (function () {
    function Field(html, piece) {
        this.html = html;
        this.piece = piece;
    }
    Field.prototype.rightClickActions = function (e) {
    };
    return Field;
}());
var Piece = /** @class */ (function () {
    function Piece(team, html, board) {
        var _this = this;
        this.startFollowingCursor = function (e) {
            var fieldCoor = _this.board.getFieldCoorByPx(e.clientX, e.clientY);
            if (currTeam !== _this.team) {
                _this.html.addEventListener("mousedown", _this.startFollowingCursor, { once: true });
                return;
            }
            _this.possMoves = _this.getPossibleMovesFromPos(fieldCoor);
            _this.board.showPossibleMoves(_this.possMoves, _this.enemyTeamNum(_this.team));
            var mouseHold = new Promise(function (resolve, reject) {
                _this.html.addEventListener("mouseup", function () {
                    reject();
                }, { once: true });
                setTimeout(function () {
                    resolve();
                }, 150);
            });
            _this.board.grabbedPiece = _this;
            _this.board.grabbedPiece.pos = fieldCoor;
            _this.board.removePieceInPos(fieldCoor);
            _this.html.id = "move";
            _this.moveToCursor(e);
            document.addEventListener("mousemove", _this.moveToCursor);
            mouseHold.then(function () {
                setTimeout(function () {
                    document.addEventListener("mouseup", _this.stopFollowingCursor, { once: true });
                });
            })["catch"](function () {
                setTimeout(function () {
                    document.addEventListener("click", _this.stopFollowingCursor, { once: true });
                });
            });
        };
        this.moveToCursor = function (e) {
            _this.board.highlightHtmlField(_this.board.getFieldCoorByPx(e.clientX, e.clientY));
            _this.html.style.transform =
                "translate(\n        ".concat(e.clientX - ((_this.board.htmlPageContainer.offsetWidth - _this.board.piecesHtml.offsetWidth) / 2) - _this.html.offsetWidth / 2, "px, \n        ").concat(e.clientY - ((_this.board.htmlPageContainer.offsetHeight - _this.board.piecesHtml.offsetHeight) / 2) - _this.html.offsetWidth / 2, "px\n      )");
        };
        this.stopFollowingCursor = function (e) {
            _this.html.id = "";
            if (document.getElementById("fieldHighlighted")) {
                document.getElementById("fieldHighlighted").id = "";
            }
            document.removeEventListener("mousemove", _this.moveToCursor);
            _this.board.hidePossibleMoves();
            var newPos = _this.board.getFieldCoorByPx(e.clientX, e.clientY);
            for (var i = 0; i < _this.possMoves.length; i++) {
                if (_this.possMoves[i].x === newPos.x && _this.possMoves[i].y === newPos.y &&
                    (newPos.x !== _this.board.grabbedPiece.pos.x || newPos.y !== _this.board.grabbedPiece.pos.y)) {
                    _this.board.placePieceInPos(newPos, _this.board.grabbedPiece, _this.board.grabbedPiece.pos);
                    _this.possMoves = [];
                    _this.board.grabbedPiece = null;
                    return;
                }
            }
            _this.board.placePieceInPos(_this.board.grabbedPiece.pos, _this.board.grabbedPiece, null);
            _this.board.grabbedPiece = null;
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
    Piece.prototype.enemyTeamNum = function (myTeamNum) {
        return (myTeamNum === whiteNum) ? blackNum : whiteNum;
    };
    Piece.prototype.getPossibleMovesFromPosForKing = function (pos) {
        var possibleMoves = [];
        return possibleMoves;
    };
    Piece.prototype.getPossibleMovesFromPos = function (pos) {
        var possibleMoves = [];
        return possibleMoves;
    };
    Piece.prototype.substracktAbsPinsFromPossMoves = function (possMoves, absPins, pos) {
        for (var p = 0; p < absPins.length; p++) {
            if (absPins[p].pinnedPiecePos.x === pos.x && absPins[p].pinnedPiecePos.y === pos.y) {
                for (var m = 0; m < possMoves.length; m++) {
                    var simplifyXAndY = (this.num === knightNum) ? false : true; // simplify means make 1 if >1 and -1 if <-1
                    var moveDir = new Dir(possMoves[m].y - pos.y, possMoves[m].x - pos.x, simplifyXAndY);
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
    };
    return Piece;
}());
var Pawn = /** @class */ (function (_super) {
    __extends(Pawn, _super);
    function Pawn(team, html, board) {
        var _this = _super.call(this, team, html, board) || this;
        _this.num = 1;
        _this.value = 1;
        _this.haventMovedYet = true;
        _this.anotherPawnPassed = null;
        _this.direction = (_this.team === whiteNum) ? new Dir(-1, 0) : new Dir(1, 0);
        return _this;
    }
    Pawn.prototype.getPossibleMovesFromPosForKing = function (pos) {
        var possibleMoves = [];
        var takesPos = [new Pos(pos.y + this.direction.y, pos.x + 1), new Pos(pos.y + this.direction.y, pos.x - 1)];
        for (var i = 0; i < takesPos.length; i++) {
            if (takesPos[i].x < 0 || takesPos[i].x > 7 || takesPos[i].y < 0 || takesPos[i].y > 7) {
                takesPos.splice(i, 1);
                continue;
            }
            possibleMoves.push(takesPos[i]);
        }
        return possibleMoves;
    };
    Pawn.prototype.getPossibleMovesFromPos = function (pos) {
        var myKing = (this.team === whiteNum) ? this.board.kings.white : this.board.kings.black;
        var absPins = myKing.getPossitionsOfAbsolutePins();
        var possibleMovesFromPosForKing = this.getPossibleMovesFromPosForKing(pos);
        for (var i = 0; i < possibleMovesFromPosForKing.length; i++) {
            if (this.board.el[possibleMovesFromPosForKing[i].y][possibleMovesFromPosForKing[i].x].piece.team === this.team ||
                this.board.el[possibleMovesFromPosForKing[i].y][possibleMovesFromPosForKing[i].x].piece.team === null) {
                possibleMovesFromPosForKing.splice(i, 1);
                i--;
            }
        }
        var possibleMoves = __spreadArray([pos], possibleMovesFromPosForKing, true);
        if (!board.el[pos.y + this.direction.y][pos.x].piece.num) {
            possibleMoves.push(new Pos(pos.y + this.direction.y, pos.x));
            if (this.haventMovedYet && !board.el[pos.y + (this.direction.y * 2)][pos.x].piece.num) {
                possibleMoves.push(new Pos(pos.y + (this.direction.y * 2), pos.x));
            }
        }
        possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);
        return possibleMoves;
    };
    return Pawn;
}(Piece));
var Rook = /** @class */ (function (_super) {
    __extends(Rook, _super);
    function Rook(team, html, board) {
        var _this = _super.call(this, team, html, board) || this;
        _this.num = 2;
        _this.value = 5;
        return _this;
    }
    Rook.prototype.getPossibleMovesFromPosForKing = function (pos) {
        var _this = this;
        var possibleMoves = [];
        var tempPos;
        var directions = [new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)];
        directions.forEach(function (dir) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (_this.board.el[tempPos.y][tempPos.x].piece.team === _this.enemyTeamNum(_this.team) &&
                    _this.board.el[tempPos.y][tempPos.x].piece.num !== kingNum) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if (tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
                if (_this.board.el[tempPos.y][tempPos.x].piece.team === _this.team) {
                    break;
                }
            }
        });
        return possibleMoves;
    };
    Rook.prototype.getPossibleMovesFromPos = function (pos) {
        var _this = this;
        var myKing = (this.team === whiteNum) ? this.board.kings.white : this.board.kings.black;
        var absPins = myKing.getPossitionsOfAbsolutePins();
        var possibleMoves = [pos];
        var tempPos;
        var directions = [new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)];
        directions.forEach(function (dir) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (_this.board.el[tempPos.y][tempPos.x].piece.team !== null &&
                    _this.board.el[tempPos.y][tempPos.x].piece.team !== _this.team) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if ((tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) ||
                    _this.board.el[tempPos.y][tempPos.x].piece.team === _this.team) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
            }
        });
        possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);
        return possibleMoves;
    };
    return Rook;
}(Piece));
var Knight = /** @class */ (function (_super) {
    __extends(Knight, _super);
    function Knight(team, html, board) {
        var _this = _super.call(this, team, html, board) || this;
        _this.num = 3;
        _this.value = 3;
        return _this;
    }
    Knight.prototype.getPossibleMovesFromPosForKing = function (pos) {
        var possibleMoves = [];
        var directions = [
            new Dir(1, 2), new Dir(1, -2), new Dir(-1, 2), new Dir(-1, -2),
            new Dir(2, 1), new Dir(2, -1), new Dir(-2, 1), new Dir(-2, -1)
        ];
        directions.forEach(function (dir) {
            if (pos.x + dir.x >= 0 && pos.x + dir.x <= 7 && pos.y + dir.y >= 0 && pos.y + dir.y <= 7) {
                possibleMoves.push(new Pos(pos.y + dir.y, pos.x + dir.x));
            }
        });
        return possibleMoves;
    };
    Knight.prototype.getPossibleMovesFromPos = function (pos) {
        var myKing = (this.team === whiteNum) ? this.board.kings.white : this.board.kings.black;
        var absPins = myKing.getPossitionsOfAbsolutePins();
        var possibleMovesFromPosForKnight = this.getPossibleMovesFromPosForKing(pos);
        for (var i = 0; i < possibleMovesFromPosForKnight.length; i++) {
            if (board.el[possibleMovesFromPosForKnight[i].y][possibleMovesFromPosForKnight[i].x].piece.team === this.team) {
                possibleMovesFromPosForKnight.splice(i, 1);
                i--;
            }
        }
        var possibleMoves = __spreadArray([pos], possibleMovesFromPosForKnight, true);
        possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);
        return possibleMoves;
    };
    return Knight;
}(Piece));
var Bishop = /** @class */ (function (_super) {
    __extends(Bishop, _super);
    function Bishop(team, html, board) {
        var _this = _super.call(this, team, html, board) || this;
        _this.num = 4;
        _this.value = 3;
        return _this;
    }
    Bishop.prototype.getPossibleMovesFromPosForKing = function (pos) {
        var _this = this;
        var possibleMoves = [];
        var tempPos;
        var directions = [new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1)];
        directions.forEach(function (dir) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (_this.board.el[tempPos.y][tempPos.x].piece.team === _this.enemyTeamNum(_this.team) &&
                    _this.board.el[tempPos.y][tempPos.x].piece.num !== kingNum) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if (tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
                if (_this.board.el[tempPos.y][tempPos.x].piece.team === _this.team) {
                    break;
                }
            }
        });
        return possibleMoves;
    };
    Bishop.prototype.getPossibleMovesFromPos = function (pos) {
        var _this = this;
        var myKing = (this.team === whiteNum) ? this.board.kings.white : this.board.kings.black;
        var absPins = myKing.getPossitionsOfAbsolutePins();
        var possibleMoves = [pos];
        var tempPos;
        var directions = [new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1)];
        directions.forEach(function (dir) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (_this.board.el[tempPos.y][tempPos.x].piece.team !== null &&
                    _this.board.el[tempPos.y][tempPos.x].piece.team !== _this.team) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if ((tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) ||
                    _this.board.el[tempPos.y][tempPos.x].piece.team === _this.team) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
            }
        });
        possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);
        return possibleMoves;
    };
    return Bishop;
}(Piece));
var Queen = /** @class */ (function (_super) {
    __extends(Queen, _super);
    function Queen(team, html, board) {
        var _this = _super.call(this, team, html, board) || this;
        _this.num = 5;
        _this.value = 9;
        return _this;
    }
    Queen.prototype.getPossibleMovesFromPosForKing = function (pos) {
        var _this = this;
        var possibleMoves = [];
        var tempPos;
        var directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        directions.forEach(function (dir) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (_this.board.el[tempPos.y][tempPos.x].piece.team === _this.enemyTeamNum(_this.team) &&
                    _this.board.el[tempPos.y][tempPos.x].piece.num !== kingNum) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if (tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
                if (_this.board.el[tempPos.y][tempPos.x].piece.team === _this.team) {
                    break;
                }
            }
        });
        return possibleMoves;
    };
    Queen.prototype.getPossibleMovesFromPos = function (pos) {
        var _this = this;
        var possibleMoves = [pos];
        var tempPos;
        var directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        directions.forEach(function (dir) {
            tempPos = new Pos(pos.y, pos.x);
            while (true) {
                if (_this.board.el[tempPos.y][tempPos.x].piece.team !== null &&
                    _this.board.el[tempPos.y][tempPos.x].piece.team !== _this.team) {
                    break;
                }
                tempPos.x += dir.x;
                tempPos.y += dir.y;
                if ((tempPos.x < 0 || tempPos.x > 7 || tempPos.y < 0 || tempPos.y > 7) ||
                    _this.board.el[tempPos.y][tempPos.x].piece.team === _this.team) {
                    break;
                }
                possibleMoves.push(new Pos(tempPos.y, tempPos.x));
            }
        });
        var myKing = (this.team === whiteNum) ? this.board.kings.white : this.board.kings.black;
        var absPins = myKing.getPossitionsOfAbsolutePins();
        possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);
        return possibleMoves;
    };
    return Queen;
}(Piece));
var King = /** @class */ (function (_super) {
    __extends(King, _super);
    function King(team, html, board) {
        var _this = _super.call(this, team, html, board) || this;
        _this.num = 6;
        _this.haventMovedYet = true;
        return _this;
    }
    King.prototype.getPossibleMovesFromPos = function (pos) {
        var _this = this;
        var possibleMoves = [pos];
        var directions = [
            new Dir(1, 1), new Dir(-1, -1), new Dir(-1, 1), new Dir(1, -1),
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1)
        ];
        directions.forEach(function (dir) {
            if (pos.x + dir.x >= 0 && pos.x + dir.x <= 7 && pos.y + dir.y >= 0 && pos.y + dir.y <= 7 &&
                _this.board.el[pos.y + dir.y][pos.x + dir.x].piece.team !== _this.team) {
                possibleMoves.push(new Pos(pos.y + dir.y, pos.x + dir.x));
            }
        });
        var enemyTeamNum = this.enemyTeamNum(this.team);
        for (var r = 0; r < this.board.el.length; r++) {
            for (var c = 0; c < this.board.el[r].length; c++) {
                if (this.board.el[r][c].piece.team !== enemyTeamNum) {
                    continue;
                }
                var enemyPiecePossMoves = this.board.el[r][c].piece.getPossibleMovesFromPosForKing(new Pos(r, c));
                for (var e = 0; e < enemyPiecePossMoves.length; e++) {
                    for (var m = 1; m < possibleMoves.length; m++) { // m=1 becouse possibleMoves[0] is kings pos
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
    };
    King.prototype.getPossitionsOfAbsolutePins = function (kingPosition) {
        var _this = this;
        var kingPos = (function () {
            if (kingPosition) {
                return kingPosition;
            }
            return (_this.team === whiteNum) ? _this.board.kings.white.pos : _this.board.kings.black.pos;
        })();
        var absPins = [];
        var directions = [
            new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir(0, -1),
            new Dir(1, 1), new Dir(-1, 1), new Dir(1, -1), new Dir(-1, -1)
        ];
        for (var d = 0; d < directions.length; d++) {
            var kingIsInlineVerticallyOrHorizontally = (directions[d].x === 0 || directions[d].y === 0);
            var tempPos = new Pos(kingPos.y, kingPos.x);
            var pinInThisDir = void 0;
            tempPos.x += directions[d].x;
            tempPos.y += directions[d].y;
            while (tempPos.x >= 0 && tempPos.x <= 7 && tempPos.y >= 0 && tempPos.y <= 7) {
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
                    if ((this.board.el[tempPos.y][tempPos.x].piece.num !== bishopNum &&
                        this.board.el[tempPos.y][tempPos.x].piece.num !== rookNum &&
                        this.board.el[tempPos.y][tempPos.x].piece.num !== queenNum) ||
                        this.board.el[tempPos.y][tempPos.x].piece.team === this.team) {
                        break;
                    }
                    if ((kingIsInlineVerticallyOrHorizontally &&
                        this.board.el[tempPos.y][tempPos.x].piece.num !== bishopNum)
                        ||
                            (!kingIsInlineVerticallyOrHorizontally &&
                                this.board.el[tempPos.y][tempPos.x].piece.num !== rookNum)) {
                        absPins.push(pinInThisDir);
                    }
                }
                tempPos.x += directions[d].x;
                tempPos.y += directions[d].y;
            }
        }
        return absPins;
    };
    return King;
}(Piece));
var Board = /** @class */ (function () {
    function Board(htmlElQuerySelector, htmlPageContainerQuerySelector) {
        this.el = [];
        this.html = document.querySelector(htmlElQuerySelector);
        this.htmlPageContainer = document.querySelector(htmlPageContainerQuerySelector);
        this.fieldsInOneRow = 8;
        var root = document.querySelector(":root");
        root.style.setProperty("--fieldSize", "".concat(this.html.offsetWidth / this.fieldsInOneRow, "px"));
        this.createContainersForFieldsAndPieces();
        this.createFields();
        this.kings = this.getKings();
    }
    Board.prototype.createContainersForFieldsAndPieces = function () {
        this.fieldsHtml = document.createElement("div");
        this.fieldsHtml.classList.add("boardFieldsContainer");
        this.html.append(this.fieldsHtml);
        this.piecesHtml = document.createElement("div");
        this.piecesHtml.classList.add("boardPiecesContainer");
        this.html.append(this.piecesHtml);
    };
    Board.prototype.getProperPieceByDeafultPosition = function (row, col) {
        var emptyFiledsPosAtBeginning = this.getEmptyFieldsPosAtBeginning();
        for (var i = 0; i < emptyFiledsPosAtBeginning.length; i++) {
            if (emptyFiledsPosAtBeginning[i].y === row && emptyFiledsPosAtBeginning[i].x === col) {
                return this.getNewPieceObj(0, null);
            }
        }
        var pieceNum = this.getPieceNumByPos(row, col);
        var team = (row < 4) ? blackNum : whiteNum;
        return this.getNewPieceObj(pieceNum, team);
    };
    Board.prototype.getNewPieceObj = function (num, team) {
        switch (num) {
            case pawnNum: return new Pawn(team, this.getNewHtmlPiece(num, team), this);
            case rookNum: return new Rook(team, this.getNewHtmlPiece(num, team), this);
            case knightNum: return new Knight(team, this.getNewHtmlPiece(num, team), this);
            case bishopNum: return new Bishop(team, this.getNewHtmlPiece(num, team), this);
            case queenNum: return new Queen(team, this.getNewHtmlPiece(num, team), this);
            case kingNum: return new King(team, this.getNewHtmlPiece(num, team), this);
            default: return new Piece(null, null, this);
        }
    };
    Board.prototype.getNewHtmlPiece = function (num, team) {
        var piece = document.createElement("div");
        piece.classList.add("piece");
        piece.style.backgroundImage = "url(./images/".concat(this.getPieceNameByNum(num, team), ".png)");
        return piece;
    };
    Board.prototype.getPieceNumByPos = function (row, col) {
        var begRookPos = [new Pos(0, 0), new Pos(0, 7)];
        for (var i = 0; i < begRookPos.length; i++) {
            if ((begRookPos[i].y === row && begRookPos[i].x === col) ||
                (this.fieldsInOneRow - 1 - begRookPos[i].y === row && begRookPos[i].x === col)) {
                return rookNum;
            }
        }
        var begKnightPos = [new Pos(0, 1), new Pos(0, 6)];
        for (var i = 0; i < begKnightPos.length; i++) {
            if ((begKnightPos[i].y === row && begKnightPos[i].x === col) ||
                (this.fieldsInOneRow - 1 - begKnightPos[i].y === row && begKnightPos[i].x === col)) {
                return knightNum;
            }
        }
        var begBishopPos = [new Pos(0, 2), new Pos(0, 5)];
        for (var i = 0; i < begBishopPos.length; i++) {
            if ((begBishopPos[i].y === row && begBishopPos[i].x === col) ||
                (this.fieldsInOneRow - 1 - begBishopPos[i].y === row && begBishopPos[i].x === col)) {
                return bishopNum;
            }
        }
        var begQueenPos = new Pos(0, 3);
        if ((begQueenPos.y === row && begQueenPos.x === col) ||
            (this.fieldsInOneRow - 1 - begQueenPos.y === row && begQueenPos.x === col)) {
            return queenNum;
        }
        var begKingPos = new Pos(0, 4);
        if ((begKingPos.y === row && begKingPos.x === col) ||
            (this.fieldsInOneRow - 1 - begKingPos.y === row && begKingPos.x === col)) {
            return kingNum;
        }
        return pawnNum;
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
                var field = document.createElement("div");
                field.classList.add("field");
                field.classList.add("field".concat(fieldNr));
                this.fieldsHtml.append(field);
                this.el[r][c] = new Field(field, this.getProperPieceByDeafultPosition(r, c));
                if (this.el[r][c].piece.num === kingNum) {
                    this.el[r][c].piece.pos = new Pos(r, c);
                }
                if (this.el[r][c].piece.html) {
                    this.piecesHtml.append(this.el[r][c].piece.html);
                    this.el[r][c].piece.html.style.transform =
                        "translate(\n              ".concat(c * this.piecesHtml.offsetWidth / this.fieldsInOneRow, "px, \n              ").concat(r * this.piecesHtml.offsetWidth / this.fieldsInOneRow, "px\n            )");
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
            case pawnNum:
                name = "pawn";
                break;
            case rookNum:
                name = "rook";
                break;
            case knightNum:
                name = "knight";
                break;
            case bishopNum:
                name = "bishop";
                break;
            case queenNum:
                name = "queen";
                break;
            case kingNum:
                name = "king";
                break;
        }
        var teamChar = (pieceTeam === blackNum) ? "B" : "W";
        return name + teamChar;
    };
    Board.prototype.placePieceInPos = function (pos, piece, from) {
        if (this.el[pos.y][pos.x].piece.html !== null) {
            this.removePieceInPos(pos, true);
        }
        if (piece.html) {
            piece.html.
                addEventListener("mousedown", piece.startFollowingCursor, { once: true });
        }
        piece.pos = (piece.num === kingNum) ? new Pos(pos.y, pos.x) : null;
        piece.html.style.transform =
            "translate(\n      ".concat(pos.x * this.piecesHtml.offsetWidth / this.fieldsInOneRow, "px, \n      ").concat(pos.y * this.piecesHtml.offsetWidth / this.fieldsInOneRow, "px\n    )");
        this.el[pos.y][pos.x].piece = piece;
        if (from) {
            moves.push(new Move(piece, from, pos));
            currTeam = (currTeam === whiteNum) ? blackNum : whiteNum;
        }
    };
    Board.prototype.getEmptyFieldsPosAtBeginning = function () {
        var fieldsPos = [];
        for (var r = 2; r < 6; r++) {
            for (var c = 0; c < this.fieldsInOneRow; c++) {
                fieldsPos.push(new Pos(r, c));
            }
        }
        return fieldsPos;
    };
    Board.prototype.removePieceInPos = function (pos, html) {
        if (html) {
            this.el[pos.y][pos.x].piece.html.remove();
        }
        this.el[pos.y][pos.x].piece = this.getNewPieceObj(0, null);
    };
    Board.prototype.getKings = function () {
        var kings = {
            white: null,
            black: null
        };
        for (var r = 0; r < this.el.length; r++) {
            for (var c = 0; c < this.el[r].length; c++) {
                if (this.el[r][c].piece.num === kingNum) {
                    switch (this.el[r][c].piece.team) {
                        case whiteNum:
                            kings.white = this.el[r][c].piece;
                            break;
                        case blackNum:
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
    };
    Board.prototype.showPossibleMoves = function (possMoves, enemyTeamNum) {
        var root = document.querySelector(":root");
        root.style.setProperty("--possMoveSize", "".concat(this.html.offsetWidth / this.fieldsInOneRow / 3, "px"));
        for (var i = 0; i < possMoves.length; i++) {
            var move = possMoves[i];
            var div = document.createElement("div");
            div.classList.add("possMove");
            if (this.el[possMoves[i].y][possMoves[i].x].piece.team === enemyTeamNum) {
                div.classList.add("possMoveTake");
            }
            div.dataset.possMove = "";
            this.el[move.y][move.x].html.append(div);
        }
    };
    Board.prototype.hidePossibleMoves = function () {
        document.querySelectorAll("[data-poss-move]").forEach(function (move) {
            move.remove();
        });
    };
    return Board;
}());
var Move = /** @class */ (function () {
    function Move(piece, from, to) {
        this.piece = piece;
        this.from = from;
        this.to = to;
    }
    return Move;
}());
function startGame() {
    board = new Board("[data-board-container]", "[data-container]");
}
startGame();
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
