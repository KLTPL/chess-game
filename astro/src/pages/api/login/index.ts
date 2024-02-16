import type { APIRoute } from "astro";
import { getUserByNameOrEmail } from "../../../db/getUser";
import fs from "fs";
import jwt from "jsonwebtoken";
import validate from "../../../utils/hash-password/validate";
import {
  LoginErrors,
  type LoginBody,
  type LoginResponse,
} from "../../../components/login/Form";
import { setUserLastLogin as DBsetUserLastLogin } from "../../../db/setUserLastLogin";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { usernameOrEmail, password } = (await request.json()) as LoginBody;
    // Do something with the data
    const user = await getUserByNameOrEmail(usernameOrEmail);

    if (user === null) {
      const response: LoginResponse = {
        errorCode: LoginErrors.USERNAME_OR_EMAIL_NOT_FOUND,
        errorMessage: "Błędny email lub nazwa użytkownika",
      };
      return new Response(JSON.stringify(response), {
        status: 401,
      });
    }
    // const result = bcrypt.compareSync(password, user.password);
    const result = validate(password, user.password, user.password_salt);
    if (result) {
      const privKey = fs.readFileSync(
        "./src/utils/generateKeypair/id_rsa_priv.pem",
        { encoding: "utf8", flag: "r" }
      );

      const token = jwt.sign(user, privKey, { algorithm: "RS256" });
      const date = new Date();
      date.setDate(date.getDate() + 14);
      cookies.set("token", token, { expires: date, path: "/" });
      DBsetUserLastLogin(user.id);
      const response: LoginResponse = { errorCode: null, errorMessage: "" };
      return new Response(JSON.stringify(response), {
        status: 200,
      });
    } else {
      const response: LoginResponse = {
        errorCode: LoginErrors.WRONG_PASSWORD,
        errorMessage: "Błędne hasło",
      };
      return new Response(JSON.stringify(response), {
        status: 401,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return new Response(null, { status: 500 });
  }
};
