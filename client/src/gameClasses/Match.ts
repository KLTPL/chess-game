import Board, { type CastlingRights } from "./board-components/Board";
import Player from "./Player";
import Halfmove from "./Halfmove";
import { TEAMS } from "./pieces/Piece";

type EndInfo = {
  cousedBy: Player | null;
  type: string;
};
type Players = {
  white: Player;
  black: Player;
};
export type PlayerArg = {
  name: string;
  // image: ImageBitmap | null;
  // timeS: number;
};
export type BoardArg = {
  htmlPageContainerQSelector: string;
  customPositionFEN: string | null;
  movesMadePreviously?: Halfmove[];
  castlingRights?: CastlingRights;
};

export default class Match {
  public isGameRunning: Boolean = true;
  public players: Players;
  private board: Board;
  constructor(
    player1Arg: PlayerArg,
    player2Arg: PlayerArg,
    boardArg: BoardArg,
    isFinished: boolean = false
  ) {
    this.board = new Board(
      boardArg.htmlPageContainerQSelector,
      boardArg.customPositionFEN,
      this
    );
    this.players = {
      white: new Player(player1Arg.name, TEAMS.WHITE, this.board),
      black: new Player(player2Arg.name, TEAMS.BLACK, this.board),
    };
  }

  public checkIfGameShouldEndAfterMove(move: Halfmove): void {
    const isItWhitesMove = move.piece.isWhite();
    const playerWhoMadeMove = isItWhitesMove
      ? this.players.white
      : this.players.black;
    const otherKingTeam = !isItWhitesMove ? TEAMS.WHITE : TEAMS.BLACK;
    const otherKing = this.board.getKingByTeam(otherKingTeam);
    const otherPlayer = !isItWhitesMove
      ? this.players.white
      : this.players.black;

    if (
      this.board.isDrawByInsufficientMaterial() ||
      this.board.isDrawByThreeMovesRepetition() ||
      this.board.isDrawByNoCapturesOrPawnMovesIn50Moves()
    ) {
      this.end({ cousedBy: playerWhoMadeMove, type: "draw" });
      return;
    }
    if (!otherPlayer.isAbleToMakeMove()) {
      const endType = otherKing.isInCheck() ? "check-mate" : "stale-mate";
      this.end({ cousedBy: playerWhoMadeMove, type: endType });
    }
  }

  public end(endType?: EndInfo): void {
    this.isGameRunning = false;
    this.board.showEventsOnBoard.turnOfCssGrabOnPieces();
    console.log("half moves: ", this.board.movesSystem.halfmoves);
    if (endType !== undefined) {
      console.log(
        `Game has ended by ${endType.cousedBy?.name} with a ${endType.type}`
      );
    } else {
      console.log("Game ended");
    }
  }
}
