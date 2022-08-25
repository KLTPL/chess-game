export default class Player {
    constructor(name, image, team, timeS, match) {
        this.name = name;
        this.image = image;
        this.team = team;
        this.points = 0;
        this.timeS = timeS;
        this.match = match;
    }
    countsPoints() {
        const board = this.match.board;
        this.points = 0;
        for (let r = 0; r < board.el.length; r++) {
            for (let c = 0; c < board.el[r].length; c++) {
                if (board.el[r][c].piece.team === this.team) {
                    this.points += board.el[r][c].piece.value;
                }
            }
        }
    }
}
