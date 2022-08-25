import Player from "./Player.js"

export default class EndType {
  cousedBy: Player;
  type: string;
  constructor(cousedBy: Player, type: string) {
    this.cousedBy = cousedBy;
    this.type = type;
  }
}