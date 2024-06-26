import type { APIRoute } from "astro";
import { getUserByNameOrEmailForLogin } from "../../../db/app-user/getUser";
import validate from "../../../scripts-server/hash-password/validate";
import {
  LoginErrors,
  type LoginBody,
  type LoginResponse,
} from "../../../components/sign-in/Form";
import { setUserLastLogin as DBsetUserLastLogin } from "../../../db/app-user/setUserLastLogin";
import sign from "../../../scripts-server/jwt/sign";
import CookiesNames from "../../../utils/CookiesNames";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const { usernameOrEmail, password } = (await request.json()) as LoginBody;
    const user = await getUserByNameOrEmailForLogin(usernameOrEmail);
    if (user === null) {
      const response: LoginResponse = {
        errorCode: LoginErrors.USERNAME_OR_EMAIL_NOT_FOUND,
        errorMessage:
          locals.langDict["sign_in_error"]["error-username_or_email_not_found"],
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
      cookies.set(CookiesNames.TOKEN_JWT, token, {
        expires: date,
        secure: true,
        path: "/",
      });
      await DBsetUserLastLogin(user.id);
      const response: LoginResponse = { errorCode: null, errorMessage: "" };
      return new Response(JSON.stringify(response), {
        status: 200,
      });
    } else {
      const response: LoginResponse = {
        errorCode: LoginErrors.WRONG_PASSWORD,
        errorMessage: locals.langDict["sign_in_error"]["error-wrong_password"],
      };
      return new Response(JSON.stringify(response), {
        status: 401,
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
