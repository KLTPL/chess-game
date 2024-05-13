import type { ReactNode } from "react";
import { GAME_RESULTS_ID_DB, type APIGetGameData } from "../../db/types.ts";
import { WIDTHS } from "./utils.ts";

type GameDisplayProps = {
  DBGameData: APIGetGameData;
  borderTop: boolean;
  borderBottom: boolean;
  langDictGameList: Record<string, string>;
};

function convertDate(date: Date) {
  const convert = (date: number) => {
    const str = String(date);
    if (str.length === 1) {
      return "0" + str;
    }
    return str;
  };

  return `${convert(date.getDate())}-${convert(date.getMonth() + 1)}-${date.getFullYear()}`;
}

function convertTimestamp(timestamp: Date) {
  const convert = (date: number) => {
    const str = String(date);
    if (str.length === 1) {
      return "0" + str;
    }
    return str;
  };
  const date = `${convert(timestamp.getDate())}-${convert(timestamp.getMonth() + 1)}-${timestamp.getFullYear()}`;
  const time = `${convert(timestamp.getHours())}:${convert(timestamp.getMinutes() + 1)}:${convert(timestamp.getSeconds())}`;
  return `${date} ${time}`;
}

export default function GameDisplay({
  DBGameData: { game, halfmoves },
  borderBottom,
  borderTop,
  langDictGameList: langDict,
}: GameDisplayProps) {
  const dateStart = convertDate(new Date(game.start_date));
  const timestampStart = convertTimestamp(new Date(game.start_date));
  const timestampEnd = convertTimestamp(new Date(game.end_date));
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
        <ColumnEl child={langDict["type-online"]} width={WIDTHS.TYPE} />
        <ColumnEl
          child={
            <div className="flex flex-col py-2">
              <div
                style={{ fontWeight: halfmoves.length % 2 == 0 ? "500" : 0 }}
                title={`@${game.user_w_name}`}
              >
                {game.user_w_display_name}
              </div>
              <div
                style={{ fontWeight: halfmoves.length % 2 != 0 ? "500" : 0 }}
                title={`@${game.user_b_name}`}
              >
                {game.user_b_display_name}
              </div>
            </div>
          }
          width={WIDTHS.PLAYERS}
        />
        <ColumnEl
          child={getGameResult(
            game.result_id,
            langDict["result-in_progress"],
            timestampEnd
          )}
          width={WIDTHS.RESULT}
        />
        <ColumnEl child={String(halfmoves.length)} width={WIDTHS.MOVES} />
        <ColumnEl
          child={<div title={timestampStart}>{dateStart}</div>}
          width={WIDTHS.DATE}
        />
      </div>
    </a>
  );
}

function getGameResult(
  resultId: GAME_RESULTS_ID_DB | null,
  inProgressTranslation: string,
  dateEnd: string
): ReactNode {
  if (resultId === GAME_RESULTS_ID_DB.WHITE) {
    return (
      <div title={dateEnd}>
        <div>1</div>
        <div>0</div>
      </div>
    );
  } else if (resultId === GAME_RESULTS_ID_DB.BLACK) {
    return (
      <div title={dateEnd}>
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
  return <div>{inProgressTranslation}</div>;
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
