import { queryDB } from "../connect";

export default async function removeGameInvite(gameInviteId: string) {
  await queryDB(
    `
    DELETE FROM game_invite 
    WHERE id = $1;
  `,
    [gameInviteId]
  );
}
