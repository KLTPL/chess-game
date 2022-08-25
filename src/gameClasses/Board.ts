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
import VisualizingArrowsArr from "./VisualizingArrowsArr.js";
import VisualizingArrow from "./VisualizingArrow.js";
import PawnPromotionMenu from "./PawnPromotionMenu.js";
import Match from "./Match.js";
import EndType from "./EndType.js";

export type BoardInfo = {
  htmlQSelector: string, 
  htmlPageContainerQSelector: string, 
  teamPerspectiveNum: number, 
  startPositionsOfPieces?: mapOfPiecesForHuman
};

type mapOfPiecesByNumber = number[][];
type mapOfPiecesForHuman = (string | number)[][];

export default class Board {
  match: Match;
  currTeam: number;
  whitesPerspective: boolean;
  moves: Move[];
  el: Field[][];
  html: HTMLElement;
  fieldsHtml: HTMLElement;
  piecesHtml: HTMLElement;
  pageContainerHtml: HTMLElement;
  fieldsInOneRow: number;
  grabbedPiece: Piece;
  kings: {
    white: King,
    black: King
  };
  noPieceNum: number;
  pawnNum: number;
  rookNum: number;
  knightNum: number;
  bishopNum: number;
  queenNum: number;
  kingNum: number;
  noTeamNum: number;
  whiteNum: number;
  blackNum: number;
  visualizingArrows: VisualizingArrowsArr;
  pawnPromotionMenu: (PawnPromotionMenu|null);
  constructor(htmlQSelector: string, htmlPageContainerQSelector: string, teamPerspectiveNum: number, match: Match, startPositionsOfPieces?: mapOfPiecesForHuman) {
    this.match = match;
    this.currTeam = 1;
    this.moves = [];
    this.el = [];
    this.html = document.querySelector(htmlQSelector);
    this.pageContainerHtml = document.querySelector(htmlPageContainerQSelector);
    this.fieldsInOneRow = 8;
    this.grabbedPiece = null;
    this.visualizingArrows = new VisualizingArrowsArr();
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

    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth/this.fieldsInOneRow}px`);

    this.createContainersForFieldsAndPieces();
    this.createFields();
    const whitesPerspective = (teamPerspectiveNum===this.whiteNum);
    this.placePieces(whitesPerspective, startPositionsOfPieces);
    this.kings = this.getKings();

    this.html.addEventListener("mousedown", this.visualizationSystem);
  }

  visualizationSystem = (ev: MouseEvent) => {
    const rightClickNum = 2;
    if( ev.button!==rightClickNum ) {
      return;
    }

    let mouseHold = new Promise<void>((resolve, reject) => {
      this.html.addEventListener(
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
      this.html.addEventListener("mouseup", endEv => {
        const startPos = this.getFieldCoorByPx(ev.clientX, ev.clientY);
        const endPos = this.getFieldCoorByPx(endEv.clientX, endEv.clientY);
        if( startPos.x===endPos.x && startPos.y===endPos.y ) {
          return;
        }
        const matchingArrowNum = this.visualizingArrows.getMatchingArrowNum(startPos, endPos);
        if( matchingArrowNum!==-1 ) {
          this.visualizingArrows.removeArrow(matchingArrowNum);
          return;
        }
        this.visualizingArrows.arr.push(new VisualizingArrow(this, startPos, endPos));
      },
      {once: true});
    }).catch( () => {
      this.toggleHighlightOnFieldOnPos(this.getFieldCoorByPx(ev.clientX, ev.clientY));
    });
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

  getNewPieceObj(num: number, team: number) {
    switch(num) {
      case this.pawnNum:   return new Pawn(team, this.getNewHtmlPiece(num, team, "piece"), this);
      case this.rookNum:   return new Rook(team, this.getNewHtmlPiece(num, team, "piece"), this);
      case this.knightNum: return new Knight(team, this.getNewHtmlPiece(num, team, "piece"), this);
      case this.bishopNum: return new Bishop(team, this.getNewHtmlPiece(num, team, "piece"), this);
      case this.queenNum:  return new Queen(team, this.getNewHtmlPiece(num, team, "piece"), this);
      case this.kingNum:   return new King(team, this.getNewHtmlPiece(num, team, "piece"), this);
      default:             return new Piece(this.noTeamNum, null, this);
    }
  }

  getNewHtmlPiece(num: number, team: number, cssClass: string) {
    let piece = document.createElement("div");
    piece.classList.add(cssClass);
    piece.style.backgroundImage = `url(../images/${this.getPieceNameByNum(num, team)}.png)`;
    return piece;
  }

  createFields() {
    this.el = [];
    let fieldNr = 0;
    for( let r=0 ; r<this.fieldsInOneRow ; r++ ) {
      this.el[r] = [];
      for( let c=0 ; c<this.fieldsInOneRow ; c++ ) {
        if( c!==0 ) {
          fieldNr = ( fieldNr===0 ) ? 1 : 0;
        }
        let field = document.createElement("div");
        field.classList.add(`field`);
        field.classList.add(`field${fieldNr}`);
        this.fieldsHtml.append(field);
        this.el[r][c] = new Field(field, this.getNewPieceObj(this.noPieceNum, this.noTeamNum));
        if( this.el[r][c].piece.num===this.kingNum ) {
          this.el[r][c].piece.pos = new Pos(r, c);
        }
        if( this.el[r][c].piece.html ) {
          this.piecesHtml.append(this.el[r][c].piece.html);
          this.el[r][c].piece.html.style.transform = 
            `translate(
              ${c*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px, 
              ${r*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px
            )`;
        }
      }
    }
  }

  placePieces(whitesPerspective: boolean, customPositions: mapOfPiecesForHuman) {
    let arrOfPiecesToPlaceByPieceNum = 
      (customPositions) ? 
      this.convertMapOfPiecesForHumanToMapForScript(customPositions) : 
      this.getMapOfPiecesInDeafultPos();
      
    if( !whitesPerspective ) {
      arrOfPiecesToPlaceByPieceNum = this.invertMap(arrOfPiecesToPlaceByPieceNum);
    }
    for( let r=0 ; r<this.el.length ; r++ ) {
      for( let c=0 ; c<this.el[r].length ; c++ ) {
        this.placePieceInPos(new Pos(r, c), arrOfPiecesToPlaceByPieceNum[r][c], Boolean(arrOfPiecesToPlaceByPieceNum[r][c].html))
      }
    }
  }

  convertMapOfPiecesForHumanToMapForScript(customPositions: mapOfPiecesForHuman) {
    return [];
  }

  getMapOfPiecesInDeafultPos() {
    const firstAndLastRowNums = [
      this.rookNum, this.knightNum, this.bishopNum, this.queenNum, this.kingNum, this.bishopNum, this.knightNum, this.rookNum
    ];

    let mapOfPieces: Piece[][] = [];

    for( let r=0 ; r<this.fieldsInOneRow ; r++ ) {
      mapOfPieces[r] = [];
      const teamNum = (r<4) ? this.blackNum : this.whiteNum;
      if( r===0 || r===this.fieldsInOneRow-1 ) {
        for( let pieceNum of firstAndLastRowNums ) {
          mapOfPieces[r].push(this.getNewPieceObj(pieceNum, teamNum));
        }
        continue;
      }

      const pieceNum = (r===1 || r===this.fieldsInOneRow-2 )  ?
        this.pawnNum :
        this.noPieceNum;
      for( let i=0 ; i<this.fieldsInOneRow ; i++ ) {
        mapOfPieces[r].push(this.getNewPieceObj(pieceNum, (pieceNum===this.noPieceNum) ? this.noTeamNum : teamNum));
      }
    }

    return mapOfPieces;
  }

  invertMap( map: mapOfPiecesByNumber ) {
    let newMap: mapOfPiecesByNumber = [];

    for( let r=map.length-1 ; r>=0 ; r-- ) {
      newMap[newMap.length] = [];
      for( let c=map[r].length-1 ; c>=0 ; c-- ) {
        newMap[newMap.length-1].push(map[r][c]);
      }
    }
    return newMap;
  }

  getFieldCoorByPx(leftPx: number, topPx: number) {
    const boardStartLeft = (this.pageContainerHtml.offsetWidth -this.html.offsetWidth) /2;
    const boardStartTop =  (this.pageContainerHtml.offsetHeight-this.html.offsetHeight)/2;

    const posOnBoardLeft = leftPx-boardStartLeft;
    const posOnBoardTop = topPx-boardStartTop;

    let fieldC = Math.ceil(posOnBoardLeft/this.html.offsetWidth *this.fieldsInOneRow)-1;
    let fieldR = Math.ceil(posOnBoardTop /this.html.offsetHeight*this.fieldsInOneRow)-1;
    if( fieldC<0 || fieldC+1>this.fieldsInOneRow ) {
      fieldC = -1;
    }
    if( fieldR<0 || fieldR+1>this.fieldsInOneRow ) {
      fieldR = -1;
    }
    return new Pos(fieldR, fieldC);
  }

  highlightFieldUnderMovingPiece(pos: Pos) {
    if( document.getElementById("fieldHighlightedUnderMovingPiece") ) {
      document.getElementById("fieldHighlightedUnderMovingPiece").id = "";
    }
    if(pos.y!==-1 && pos.x!==-1) {
      this.el[pos.y][pos.x].html.id = "fieldHighlightedUnderMovingPiece";
    }
  }

  toggleHighlightOnFieldOnPos(pos: Pos) {
    this.el[pos.y][pos.x].html.classList.toggle("highlighted");
  }

  turnOfHighlightOnAllFields() {
    const fields = document.getElementsByClassName("highlighted");
    for( let i=0 ; i<fields.length ; i++ ) {
      fields[i].classList.remove("highlighted");
      i--;
    }
  }

  getPieceNameByNum( pieceNum: number, pieceTeam: number ) {
    let name: string;
    switch(pieceNum) {
      case this.pawnNum: name = "pawn"; break;
      case this.rookNum: name = "rook"; break;
      case this.knightNum: name = "knight"; break;
      case this.bishopNum: name = "bishop"; break;
      case this.queenNum: name = "queen"; break;
      case this.kingNum: name = "king"; break;
    }
    let teamChar = (pieceTeam===this.blackNum) ? "B" : "W";
    return name + teamChar;
  }

  placePieceInPos( pos: Pos, piece: Piece, appendHtml?: boolean ) {
    if( appendHtml ) {
      this.piecesHtml.append(piece.html);
    }
    if( piece.html ) {
      piece.html.
      addEventListener(
        "mousedown",
        piece.startFollowingCursor,
        {once: true}
      );
      piece.html.style.transform = 
      `translate(
        ${pos.x*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px, 
        ${pos.y*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px
      )`;
    }
    piece.pos = (piece.num===this.kingNum) ? new Pos(pos.y, pos.x) : null;
    this.el[pos.y][pos.x].piece = piece;
  }

  movePiece(from: Pos, to: Pos, piece: Piece ) {
    if( this.el[to.y][to.x].piece.html!==null ) {
      this.removePieceInPos(to, true);
    }
    if( this.el[from.y][from.x].piece.num ) {
      this.el[from.y][from.x].piece = new Piece(0, null, null);
    }
    this.moves.push(new Move(piece, from, to));
    this.currTeam = (this.currTeam===this.whiteNum) ? this.blackNum : this.whiteNum;
    this.turnOfHighlightOnAllFields();
    this.visualizingArrows.removeAllArrows();
    this.placePieceInPos(to, piece);
    const movingPiecesKing = (piece.team===this.whiteNum) ? this.kings.black : this.kings.white;
    movingPiecesKing.updateChecksArr();
    let hasMoves = false;
    for( let r=0 ; r<this.el.length ; r++ ) {
      for( let c=0 ; c<this.el[r].length ; c++ ) {
        if( this.el[r][c].piece.team!==piece.enemyTeamNum() ) {
          continue;
        }
        const pieceCanMove = (this.el[r][c].piece.getPossibleMovesFromPos(new Pos(r, c)).length===1) ? false : true;
        if( pieceCanMove ) {
          hasMoves = true;
          break;
        }
      }
    }
    if( !hasMoves ) {
      const cousedBy = (piece.team===this.whiteNum) ? this.match.players.white : this.match.players.black;
      if( movingPiecesKing.checks.length===0 ) {
        this.match.end(new EndType(cousedBy, "stale-mate")); // have to check if stale-mated king has other pieces to move
      } else {
        this.match.end(new EndType(cousedBy, "check-mate"));
      }
      console.log(this.match)

    }
  }

  getEmptyFieldsPosAtBeginning() {
    let fieldsPos: Pos[] = [];
    for( let r=2 ; r<6 ; r++ ) {
      for( let c=0 ; c<this.fieldsInOneRow ; c++ ) {
        fieldsPos.push(new Pos(r, c));
      }
    }
    return fieldsPos;
  }

  removePieceInPos(pos: Pos, html?: boolean) {
    if( html ) {
      this.el[pos.y][pos.x].piece.html.remove();
    }
    this.el[pos.y][pos.x].piece = this.getNewPieceObj(0, null);
  }

  getKings() {
    let kings: {
      white: King,
      black: King
    } = {
      white: null,
      black: null
    };
    for( let r=0 ; r<this.el.length ; r++ ) {
      for( let c=0 ; c<this.el[r].length ; c++ ) {
        if( this.el[r][c].piece.num===this.kingNum ) {
          switch(this.el[r][c].piece.team) {
            case this.whiteNum: kings.white = this.el[r][c].piece as King; break;
            case this.blackNum: kings.black = this.el[r][c].piece as King; break;
          }
        }
        if( kings.white && kings.black ) {
          return kings;
        }
      }
    }
    return kings;
  }

  showPossibleMoves(possMoves: Pos[], enemyTeamNum: number) {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--possMoveSize", `${this.html.offsetWidth/this.fieldsInOneRow/3}px`);
    for( let i=0 ; i<possMoves.length ; i++ ) {
      const move = possMoves[i];
      const div = document.createElement("div");
      div.classList.add("possMove");
      if( this.el[possMoves[i].y][possMoves[i].x].piece.team===enemyTeamNum ) {
        div.classList.add("possMoveTake");
      }
      div.dataset.possMove = "";
      this.el[move.y][move.x].html.append(div);
    }
  }

  hidePossibleMoves() {
    document.querySelectorAll("[data-poss-move]").forEach( move => {
      move.remove();
    });
  }
}