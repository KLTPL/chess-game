import { queryDB } from "../connect";
import { v4 as uuidv4 } from "uuid";

export default async function addNewGame(
  userId1: string,
  userId2: string,
  isUser1White: boolean | null // is null then it is not set so it will be randomized
): Promise<string> {
  const displayId = await generateUniqueDisplayId();

  if (
    isUser1White === false ||
    (isUser1White === null && Math.round(Math.random()) === 0)
  ) {
    const temp = userId1;
    userId1 = userId2;
    userId2 = temp;
  }
  await queryDB(
    `
    INSERT INTO game 
       (display_id, user_w_id, user_b_id)
    VALUES ($1, $2, $3);`,
    [displayId, userId1, userId2]
  );
  return displayId;
}

async function generateUniqueDisplayId(): Promise<string> {
  let displayId = uuidv4();
  while (!(await isDisplayIdUnique(displayId))) {
    displayId = uuidv4();
  }
  return displayId;
}

async function isDisplayIdUnique(displayId: string): Promise<boolean> {
  const queryRes = await queryDB(`SELECT * FROM game WHERE display_id = $1`, [
    displayId,
  ]);
  return queryRes.rows.length === 0;
}
