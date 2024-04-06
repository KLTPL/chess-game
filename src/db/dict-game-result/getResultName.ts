import { queryDB } from "../connect";

export type getResultNameProps = {
  resultName: string;
};

export default async function getResultName(
  id: string | number
): Promise<getResultNameProps | null> {
  const resResultName = await queryDB(
    `
    SELECT name FROM dict_game_result WHERE id = $1;
  `,
    [id]
  );

  if (resResultName.rowCount === 0) {
    return null;
  }

  return {
    resultName: resResultName.rows[0].name,
  };
}
