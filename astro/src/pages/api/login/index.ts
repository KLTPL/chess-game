import type { APIRoute } from "astro";
import { getUserByNameOrEmail } from "../../../db/getUser";
import validate from "../../../utils/hash-password/validate";
import {
  LoginErrors,
  type LoginBody,
  type LoginResponse,
} from "../../../components/login/Form";
import { setUserLastLogin as DBsetUserLastLogin } from "../../../db/setUserLastLogin";
import sign from "../../../utils/jwt/sign";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { usernameOrEmail, password } = (await request.json()) as LoginBody;
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
    const result = validate(password, user.password, user.password_salt);
    if (result) {
      const token = sign(user);
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
