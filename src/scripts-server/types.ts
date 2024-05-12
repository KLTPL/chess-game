import type { PIECE_SYMBOLS } from "../db/types";

type Pos = {
  y: number;
  x: number;
};

export type MoveStream = {
  from: Pos;
  to: Pos;
  promotedTo: null | PIECE_SYMBOLS;
};
