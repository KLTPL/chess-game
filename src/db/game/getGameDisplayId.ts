import { queryDB } from "../connect";

export async function getGameDisplayId(gameId: string): Promise<string | null> {
  const res = await queryDB(
    `
    SELECT display_id FROM game
    WHERE id = $1`,
    [gameId]
  );
  if (res.rows.length === 0) {
    return null;
  }
  return res.rows[0].display_id as string;
}
