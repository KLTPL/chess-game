import { queryDB } from "./connect";

export type getEndReasonNameProps = {
  endReason: string;
};

export default async function getEndReasonName(
  id: string | number
): Promise<getEndReasonNameProps | null> {
  const resResultName = await queryDB(
    `
    SELECT name FROM dict_game_end_reason WHERE id = $1;
  `,
    [id]
  );

  if (resResultName.rowCount === 0) {
    return null;
  }

  return {
    endReason: resResultName.rows[0].name,
  };
}
