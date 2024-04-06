import { useRef, useState } from "react";
import type { Err, ErrRef, FieldData } from "../auth-form/AuthForm";
import AuthForm, { errRef } from "../auth-form/AuthForm";

type ErrorsRegisterForm = {
  email: ErrRef;
  username: ErrRef;
  displayName: ErrRef;
  password: ErrRef;
};

export const enum RegisterErrors {
  USERNAME_TAKEN,
  EMAIL_TAKEN,
  EMAIL_NOT_VALID,
  USERNAME_TO_LONG,
  USERNAME_WITH_FORBIDDEN_CHARACKTERS,
  DISPLAY_NAME_TO_LONG,
  EMAIL_TO_LONG,
  PASSWORD_TO_LONG,
}

export type RegisterBody = {
  email: string;
  username: string;
  displayName: string;
  password: string;
};

export type RegisterResponse = {
  errorCode: RegisterErrors | null;
  errorMessage: string;
};

export default function Form() {
  // const emailRef = useRef<HTMLInputElement|null>(null);
  // const passwordRef = useRef<HTMLInputElement|null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const displayNameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [
    {
      password: passwordErr,
      username: usernameErr,
      displayName: displayNameErr,
      email: emailErr,
    },
    setErrors,
  ] = useState<ErrorsRegisterForm>({
    password: errRef(null),
    username: errRef(null),
    displayName: errRef(null),
    email: errRef(null),
  });

  async function fetchForm() {
    const email = emailRef.current?.value;
    const username = usernameRef.current?.value;
    const displayName = displayNameRef.current?.value;
    const password = passwordRef.current?.value;
    if (
      email !== undefined &&
      email.length > 0 &&
      username !== undefined &&
      username.length > 0 &&
      displayName !== undefined &&
      password !== undefined &&
      password.length > 0
    ) {
      const body: RegisterBody = {
        email,
        username,
        displayName,
        password,
      };
      const response = await fetch(
        `${import.meta.env.PUBLIC_URL}/api/register`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

      const { errorCode, errorMessage }: RegisterResponse =
        await response.json();
      if (errorCode !== null) {
        if (
          errorCode === RegisterErrors.USERNAME_TAKEN ||
          errorCode === RegisterErrors.USERNAME_TO_LONG ||
          errorCode === RegisterErrors.USERNAME_WITH_FORBIDDEN_CHARACKTERS
        ) {
          setErrors({
            password: errRef(null),
            username: errRef(errorMessage),
            displayName: errRef(null),
            email: errRef(null),
          });
        } else if (
          errorCode === RegisterErrors.EMAIL_TAKEN ||
          errorCode === RegisterErrors.EMAIL_TO_LONG ||
          errorCode === RegisterErrors.EMAIL_NOT_VALID
        ) {
          setErrors({
            password: errRef(null),
            username: errRef(null),
            displayName: errRef(null),
            email: errRef(errorMessage),
          });
        } else if (errorCode === RegisterErrors.PASSWORD_TO_LONG) {
          setErrors({
            password: errRef(errorMessage),
            username: errRef(null),
            displayName: errRef(null),
            email: errRef(null),
          });
        } else if (errorCode === RegisterErrors.DISPLAY_NAME_TO_LONG) {
          setErrors({
            password: errRef(null),
            username: errRef(null),
            displayName: errRef(errorMessage),
            email: errRef(null),
          });
        }
      } else {
        window.document.location.href = "/login";
      }
    }
  }
  const fields: FieldData[] = [
    {
      errorRef: emailErr,
      fieldText: "Email:",
      inputRef: emailRef,
      inputType: "email",
      keyword: "email",
    },
    {
      errorRef: usernameErr,
      fieldText: "Nazwa użytkownika:",
      inputRef: usernameRef,
      inputType: "text",
      keyword: "username",
    },
    {
      errorRef: displayNameErr,
      fieldText: "Wyświetlana nazwa użytkownika:",
      inputRef: displayNameRef,
      inputType: "text",
      keyword: "display-name",
      isNotRequired: true,
    },
    {
      errorRef: passwordErr,
      fieldText: "Hasło:",
      inputRef: passwordRef,
      inputType: "password",
      keyword: "password",
    },
  ];

  return (
    <AuthForm
      fetchForm={fetchForm}
      fields={fields}
      headerText="Zarejestruj"
      submintText="Zarejestruj"
    />
  );
}
