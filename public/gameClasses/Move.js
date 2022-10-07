export default class Move {
    constructor(piece, from, to, capture) {
        this.piece = piece;
        this.from = from;
        this.to = to;
        this.capture = capture;
    }
}
