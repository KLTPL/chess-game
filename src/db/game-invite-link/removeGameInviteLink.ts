import { queryDB } from "../connect";

export default async function removeGameInviteLink(id: string) {
  await queryDB(
    `
    DELETE FROM game_invite_link
    WHERE id = $1;
  `,
    [id]
  );
}
