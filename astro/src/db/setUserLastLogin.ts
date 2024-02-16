import { queryDB } from "./connect";

function format(dateNum: number) {
  return ("0" + dateNum).slice(-2); // slice(-2) - take last 2 digits
}

export async function setUserLastLogin(id: number | string): Promise<void> {
  const now = new Date();
  const year = now.getFullYear();
  const month = format(now.getMonth() + 1);
  const day = format(now.getDate());
  const hour = format(now.getHours());
  const min = format(now.getMinutes());
  const sec = format(now.getSeconds());

  await queryDB(
    `UPDATE app_user
      SET date_last_login = $1
      WHERE id = $2`,
    [`${year}/${month}/${day} ${hour}:${min}:${sec}`, id]
  );
}
