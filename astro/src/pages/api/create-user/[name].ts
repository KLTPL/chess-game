import type { APIRoute } from "astro";
import { queryDB } from "../../../db/connect";
import encrpt from "../../../utils/hash-password/encrypt";

export const GET: APIRoute = async ({ params }) => {
  const name = params.name as string;
  const { hash, salt } = encrpt("123");
  await queryDB(
    `
    INSERT INTO app_user
    (email, name, display_name, password, password_salt)
    VALUES ($1, $2, $3, $4, $5);`,
    [`${name}@email.com`, name, name, hash, salt]
  );

  return new Response(JSON.stringify({ tak: "tak" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
