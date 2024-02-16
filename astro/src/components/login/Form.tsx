import { useRef, useState } from "react";

type ErrorsLoginForm = {
  usernameOrEmail: string | null;
  password: string | null;
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

export default function Form() {
  // const emailRef = useRef<HTMLInputElement|null>(null);
  // const passwordRef = useRef<HTMLInputElement|null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [
    { password: passwordErr, usernameOrEmail: usernameOrEmailErr },
    setErrors,
  ] = useState<ErrorsLoginForm>({ password: null, usernameOrEmail: null });

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
      const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { errorCode, errorMessage }: LoginResponse = await response.json();
      if (errorCode !== null) {
        if (errorCode === LoginErrors.USERNAME_OR_EMAIL_NOT_FOUND) {
          setErrors({ password: null, usernameOrEmail: errorMessage });
        } else if (errorCode === LoginErrors.WRONG_PASSWORD) {
          setErrors({ usernameOrEmail: null, password: errorMessage });
        }
      } else {
        window.document.location.href = "/";
      }
    }
  }

  return (
    <form onSubmit={(ev) => ev.preventDefault()}>
      <label htmlFor="username-or-email">Email lub nazwa użytkownika:</label>
      <br />
      <input
        type="text"
        id="username-or-email"
        name="username-or-email"
        required
        className="text-black"
        ref={usernameRef}
        defaultValue={"kltpl"}
      />
      <br /> <br />
      {usernameOrEmailErr !== null && (
        <div className="text-red-700">{usernameOrEmailErr}</div>
      )}
      <label htmlFor="password">Hasło:</label>
      <br />
      <input
        type="password"
        id="password"
        name="password"
        required
        className="text-black"
        ref={passwordRef}
        defaultValue={"123"}
      />
      <br />
      {passwordErr !== null && (
        <div className="text-red-700">{passwordErr}</div>
      )}
      <br />
      <input type="submit" value="Zaloguj" onClick={fetchForm} />
    </form>
  );
}
