import EventEmitter from "events";
import type { MoveStream } from "./types";

export type SendEventObj = {
  current: (move: MoveStream) => void;
};

export default class OnlineGameController {
  private static instances = new Map<string, OnlineGameController>();
  private emitter = new EventEmitter();
  private connectedCount = 0;
  private constructor() {}

  static getInstance(displayId: string): OnlineGameController {
    if (!OnlineGameController.instances.has(displayId)) {
      OnlineGameController.instances.set(displayId, new OnlineGameController());
    }
    return OnlineGameController.instances.get(
      displayId
    ) as OnlineGameController;
  }

  public subscribe(sendEventObj: SendEventObj): void {
    this.connectedCount++;
    this.emitter.on("move", sendEventObj.current);
  }

  public unsubscribe(sendEventObj: SendEventObj): void {
    this.connectedCount--;
    this.emitter.off("move", sendEventObj.current);
  }

  public addMove(move: MoveStream): void {
    this.emitter.emit("move", move);
    throw new Error("GÓWNO");
  }
}
