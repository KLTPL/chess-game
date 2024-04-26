import { defineMiddleware } from "astro:middleware";
import verify from "../utils/jwt/verify";
import CookiesNames from "../utils/CookiesNames";
import isUserInDB from "../db/app-user/isUserInDB";

const PROTECTED_PATHS = [
  "/online",
  "/friends",
  "/api/friend-invite/*",
  "/api/game-invite/*",
  "/api/game-invite-link/*",
  "/game-invite/*",
  "/api/friend-connection/*",
  "/api/friends",
  "/api/related-users.json",
  "/api/search-alias/*",
];

const protect = defineMiddleware(
  async ({ url, cookies, redirect, locals }, next) => {
    try {
      const isProtected = isPathProtected(url.pathname);
      if (
        url.pathname.slice(0, 4) !== "/api" &&
        !isProtected &&
        url.pathname !== "/sign-in" &&
        url.pathname !== "/sign-up"
      ) {
        cookies.delete(CookiesNames.COOKIE_BACK_AFTER_LOGIN);
      }
      const token = cookies.get(CookiesNames.TOKEN_JWT)?.value;

      if (token === undefined) {
        if (isProtected) {
          cookies.set(CookiesNames.COOKIE_BACK_AFTER_LOGIN, url.pathname, {
            path: "/",
            secure: true,
          });
          return redirect("/sign-in");
        }
        return next();
      }

      const verified = verify(token);
      if (verified === false) {
        cookies.delete(CookiesNames.TOKEN_JWT, { path: "/" });
        if (isProtected) {
          cookies.set(CookiesNames.COOKIE_BACK_AFTER_LOGIN, url.pathname, {
            path: "/",
            secure: true,
          });
          return redirect("/sign-in");
        }
        return next();
      }

      if (!(await isUserInDB(verified.id))) {
        cookies.delete(CookiesNames.TOKEN_JWT, { path: "/" });
        return next();
      }

      locals.user = {
        id: verified.id,
      };

      return next();
    } catch (err) {
      console.error(err);
      return next();
    }
  }
);

function isPathProtected(pathname: string) {
  for (const path of PROTECTED_PATHS) {
    const idx = pathname.indexOf(path.slice(0, -1));
    if (
      path === pathname ||
      (path.slice(path.length - 2, path.length) === "/*" && idx === 0)
    ) {
      return true;
    }
  }
  return false;
}

export default protect;
