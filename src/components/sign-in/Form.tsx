import { useRef, useState } from "react";
import Cookies from "js-cookie";
import CookiesNames from "../../utils/CookiesNames";
import type { FieldData } from "../auth-form/AuthForm";
import AuthForm, { errRef } from "../auth-form/AuthForm";

type ErrorsLoginForm = {
  usernameOrEmail: { current: string | null };
  password: { current: string | null };
};

export const enum LoginErrors {
  USERNAME_OR_EMAIL_NOT_FOUND,
  WRONG_PASSWORD,
}

export type LoginBody = {
  usernameOrEmail: string;
  password: string;
};

export type LoginResponse = {
  errorCode: LoginErrors | null;
  errorMessage: string;
};

type FormProps = {
  langDict: Record<string, string>;
};

export default function Form({ langDict }: FormProps) {
  // const emailRef = useRef<HTMLInputElement|null>(null);
  // const passwordRef = useRef<HTMLInputElement|null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [
    { password: passwordErr, usernameOrEmail: usernameOrEmailErr },
    setErrors,
  ] = useState<ErrorsLoginForm>({
    password: errRef(null),
    usernameOrEmail: errRef(null),
  });

  async function fetchForm() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;
    if (
      username !== undefined &&
      username.length > 0 &&
      password !== undefined &&
      password.length > 0
    ) {
      const body: LoginBody = {
        usernameOrEmail: username,
        password,
      };
      const goBack = Cookies.get(CookiesNames.COOKIE_BACK_AFTER_LOGIN);
      const response = await fetch(`/api/sign-in`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { errorCode, errorMessage }: LoginResponse = await response.json();
      if (errorCode !== null) {
        if (errorCode === LoginErrors.USERNAME_OR_EMAIL_NOT_FOUND) {
          setErrors({
            password: errRef(null),
            usernameOrEmail: errRef(errorMessage),
          });
        } else if (errorCode === LoginErrors.WRONG_PASSWORD) {
          setErrors({
            usernameOrEmail: errRef(null),
            password: errRef(errorMessage),
          });
        }
      } else {
        Cookies.remove(CookiesNames.COOKIE_BACK_AFTER_LOGIN);
        window.document.location.href = goBack === undefined ? "/" : goBack;
      }
    }
  }

  const fields: FieldData[] = [
    {
      errorRef: usernameOrEmailErr,
      fieldText: langDict["alias"],
      inputRef: usernameRef,
      inputType: "text",
      keyword: "username-or-email",
    },
    {
      errorRef: passwordErr,
      fieldText: langDict["password"],
      inputRef: passwordRef,
      inputType: "password",
      keyword: "password",
    },
  ];

  return (
    <AuthForm
      fetchForm={fetchForm}
      fields={fields}
      headerText={langDict["sign_in"]}
      submintText={langDict["sign_in"]}
    />
  );
}
