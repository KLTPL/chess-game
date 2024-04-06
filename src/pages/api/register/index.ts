import type { APIRoute } from "astro";
import {
  RegisterErrors,
  type RegisterBody,
  type RegisterResponse,
} from "../../../components/register/Form";
import { getUserByEmail, getUserByName } from "../../../db/app-user/getUser";
import addNewUser from "../../../db/app-user/addNewUser";
import Validator from "email-validator";

const NAME_AND_EMAIL_MAX = 50;
const PASSWORD_MAX = 100;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as RegisterBody;
    const { email, username, displayName, password } = body;
    if (email.length > NAME_AND_EMAIL_MAX) {
      return getResponseObj(
        RegisterErrors.EMAIL_TO_LONG,
        `Email musi mieć ${NAME_AND_EMAIL_MAX} znaków lub mniej`,
        400
      );
    }
    if (!Validator.validate(email)) {
      return getResponseObj(
        RegisterErrors.EMAIL_NOT_VALID,
        `Nieprawidłowy email`,
        400
      );
    }
    if (username.length > NAME_AND_EMAIL_MAX) {
      return getResponseObj(
        RegisterErrors.USERNAME_TO_LONG,
        `Nazwa użytkownika musi mieć ${NAME_AND_EMAIL_MAX} znaków lub mniej`,
        400
      );
    }
    const regex = /^[a-zA-Z0-9._]+$/; // tests for letters, numbers, periods, and underscores
    if (!regex.test(username)) {
      return getResponseObj(
        RegisterErrors.USERNAME_WITH_FORBIDDEN_CHARACKTERS,
        `Nazwa użytkownika może zawierać tylko litery, cyfry, przecinki i podłogi`,
        400
      );
    }
    if (displayName.length > NAME_AND_EMAIL_MAX) {
      return getResponseObj(
        RegisterErrors.DISPLAY_NAME_TO_LONG,
        `Wyświetlana nazwa użytkownika musi mieć ${NAME_AND_EMAIL_MAX} znaków lub mniej`,
        400
      );
    }
    if (password.length > PASSWORD_MAX) {
      return getResponseObj(
        RegisterErrors.PASSWORD_TO_LONG,
        `Hasło musi mieć ${PASSWORD_MAX} znaków lub mniej`,
        400
      );
    }

    const userEmail = await getUserByEmail(email);
    if (userEmail !== null) {
      return getResponseObj(
        RegisterErrors.EMAIL_TAKEN,
        `Email już w użyciu`,
        409
      );
    }

    const userUsername = await getUserByName(username);
    if (userUsername !== null) {
      return getResponseObj(
        RegisterErrors.USERNAME_TAKEN,
        `Nazwa użytkownika już w użyciu`,
        409
      );
    }
    addNewUser(body);
    return getResponseObj(null, "", 200);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};

function getResponseObj(
  errCode: RegisterErrors | null,
  message: string,
  status: number
): Response {
  const response: RegisterResponse = {
    errorCode: errCode,
    errorMessage: message,
  };
  return new Response(JSON.stringify(response), {
    status: status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
