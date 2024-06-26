import type { APIRoute } from "astro";
import {
  RegisterErrors,
  type RegisterBody,
  type RegisterResponse,
} from "../../../components/sign-up/Form";
import { getUserByEmail, getUserByName } from "../../../db/app-user/getUser";
import addNewUser from "../../../db/app-user/addNewUser";
import Validator from "email-validator";

const NAME_AND_DISPLAY_NAME_MAX = 20; // the same as in the database
const EMAIL_MAX = 50;
const PASSWORD_MAX = 100;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = (await request.json()) as RegisterBody;
    const { email, username, displayName, password } = body;
    const LD = locals.langDict["sign_up_error"];
    if (email.length > EMAIL_MAX) {
      return getResponseObj(
        RegisterErrors.EMAIL_TO_LONG,
        `${LD["error-email_to_long_1"]} ${EMAIL_MAX} ${LD["error-email_to_long_2"]}`,
        400
      );
    }
    if (!Validator.validate(email)) {
      return getResponseObj(
        RegisterErrors.EMAIL_NOT_VALID,
        LD["error-email_not_valid"],
        400
      );
    }
    if (username.length > NAME_AND_DISPLAY_NAME_MAX) {
      return getResponseObj(
        RegisterErrors.USERNAME_TO_LONG,
        `${LD["error-username_to_long_1"]} ${NAME_AND_DISPLAY_NAME_MAX} ${LD["error-username_to_long_2"]}`,
        400
      );
    }
    const regex = /^[a-zA-Z0-9._]+$/; // tests for letters, numbers, periods, and underscores
    if (!regex.test(username)) {
      return getResponseObj(
        RegisterErrors.USERNAME_WITH_FORBIDDEN_CHARACKTERS,
        LD["error-username_with_forbidden_charackters"],
        400
      );
    }
    if (displayName.length > NAME_AND_DISPLAY_NAME_MAX) {
      return getResponseObj(
        RegisterErrors.DISPLAY_NAME_TO_LONG,
        `${LD["error-display_name_to_long_1"]} ${NAME_AND_DISPLAY_NAME_MAX} ${LD["error-display_name_to_long_2"]}`,
        400
      );
    }
    if (password.length > PASSWORD_MAX) {
      return getResponseObj(
        RegisterErrors.PASSWORD_TO_LONG,
        `${LD["error-password_to_long_1"]} ${PASSWORD_MAX} ${LD["error-password_to_long_2"]}`,
        400
      );
    }

    const userEmail = await getUserByEmail(email);
    if (userEmail !== null) {
      return getResponseObj(
        RegisterErrors.EMAIL_TAKEN,
        LD["error-email_taken"],
        409
      );
    }

    const userUsername = await getUserByName(username);
    if (userUsername !== null) {
      return getResponseObj(
        RegisterErrors.USERNAME_TAKEN,
        LD["error-username_taken"],
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
