import { useRef, useState } from "react";

type ErrorsRegisterForm = {
  email: string | null;
  username: string | null;
  displayName: string | null;
  password: string | null;
};

export const enum RegisterErrors {
  USERNAME_TAKEN,
  EMAIL_TAKEN,
  USERNAME_TO_LONG,
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
    { password: passwordErr, username: usernameErr, displayName: displayNameErr, email: emailErr },
    setErrors,
  ] = useState<ErrorsRegisterForm>({ password: null, username: null, displayName: null, email: null });

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
      const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/register`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const { errorCode, errorMessage }: RegisterResponse = await response.json();
      if (errorCode !== null) {
        if (errorCode === RegisterErrors.USERNAME_TAKEN || errorCode === RegisterErrors.USERNAME_TO_LONG) {
          setErrors({ password: null, username: errorMessage, displayName: null, email: null });
        } else if (errorCode === RegisterErrors.EMAIL_TAKEN || errorCode === RegisterErrors.EMAIL_TO_LONG) {
          setErrors({ password: null, username: null, displayName: null, email: errorMessage });
        } else if (errorCode === RegisterErrors.PASSWORD_TO_LONG) {
          setErrors({ password: errorMessage, username: null, displayName: null, email: null });
        } else if (errorCode === RegisterErrors.DISPLAY_NAME_TO_LONG) {
          setErrors({ password: null, username: null, displayName: errorMessage, email: null });
        }
      } else {
        window.document.location.href = "/";
      }
    }
  }

  return (
    <form onSubmit={(ev) => ev.preventDefault()}>
      <label htmlFor="email">Email:</label>
      <br />
      <input
        type="email"
        id="email"
        name="email"
        required
        className="text-black"
        ref={emailRef}
      />
      <br /> <br />
      {emailErr !== null && (
        <div className="text-red-700">{emailErr}</div>
      )}
      <label htmlFor="username">Nazwa użytkownika:</label>
      <br />
      <input
        type="text"
        id="username"
        name="username"
        required
        className="text-black"
        ref={usernameRef}
      />
      <br /> <br />
      {usernameErr !== null && (
        <div className="text-red-700">{usernameErr}</div>
      )}
      <label htmlFor="display-name">Wyświetlana nazwa użytkownika (niewymagane):</label>
      <br />
      <input
        type="text"
        id="display-name"
        name="display-name"
        className="text-black"
        ref={displayNameRef}
      />
      <br /> <br />
      {displayNameErr !== null && (
        <div className="text-red-700">{displayNameErr}</div>
      )}
      <label htmlFor="password">Nazwa użytkownika:</label>
      <br />
      <input
        type="password"
        id="password"
        name="password"
        required
        className="text-black"
        ref={passwordRef}
      />
      <br /> <br />
      {passwordErr !== null && (
        <div className="text-red-700">{passwordErr}</div>
      )}
      <input type="submit" value="Zaloguj" onClick={fetchForm} />
    </form>
  );
}
