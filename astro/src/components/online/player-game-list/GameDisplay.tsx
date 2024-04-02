import type { ReactNode } from "react";
import { GAME_RESULTS_ID_DB, type GetDBGameData } from "../../../db/types.ts";
import { WIDTHS } from "./utils";

type GameDisplayProps = {
  DBGameData: GetDBGameData;
  borderTop: boolean;
  borderBottom: boolean;
};

export default function GameDisplay({
  DBGameData: { game, halfmoves },
  borderBottom,
  borderTop,
}: GameDisplayProps) {
  const d = new Date(game.start_date);
  const convert = (date: number) => {
    const str = String(date);
    if (str.length === 1) {
      return "0" + str;
    }
    return str;
  };
  return (
    <a
      href={`/online-game/${game.display_id}`}
      style={{
        borderBottomWidth: borderBottom ? "2px" : 0,
        borderTopWidth: borderTop ? "2px" : 0,
      }}
      className="border-bg4"
    >
      <div className="flex w-full flex-row bg-bg2">
        <ColumnEl child="Online" width={WIDTHS.TYPE} />
        <ColumnEl
          child={
            <div className="flex flex-col py-2">
              <div
                style={{ fontWeight: halfmoves.length % 2 == 0 ? "500" : 0 }}
                title={game.user_w_name}
              >
                {game.user_w_display_name}
              </div>
              <div
                style={{ fontWeight: halfmoves.length % 2 != 0 ? "500" : 0 }}
                title={game.user_b_name}
              >
                {game.user_b_display_name}
              </div>
            </div>
          }
          width={WIDTHS.PLAYERS}
        />
        <ColumnEl child={getGameResult(game.result_id)} width={WIDTHS.RESULT} />
        <ColumnEl child={String(halfmoves.length)} width={WIDTHS.MOVES} />
        <ColumnEl
          child={`${convert(d.getDay())}-${convert(d.getMonth())}-${d.getFullYear()}`}
          width={WIDTHS.DATE}
        />
      </div>
    </a>
  );
}

function getGameResult(resultId: GAME_RESULTS_ID_DB | null): ReactNode {
  if (resultId === GAME_RESULTS_ID_DB.WHITE) {
    return (
      <div>
        <div>1</div>
        <div>0</div>
      </div>
    );
  } else if (resultId === GAME_RESULTS_ID_DB.BLACK) {
    return (
      <div>
        <div>0</div>
        <div>1</div>
      </div>
    );
  } else if (resultId === GAME_RESULTS_ID_DB.DRAW) {
    return (
      <div>
        <div>0</div>
        <div>0</div>
      </div>
    );
  }
  return <div>W grze</div>;
}

type ColumnElProps = {
  child: ReactNode;
  width: number;
};

function ColumnEl({ child, width }: ColumnElProps) {
  return (
    <div
      style={{ width: `${width}%` }}
      className="grid place-content-center text-center"
    >
      {child}
    </div>
  );
}
