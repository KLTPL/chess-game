import { defineMiddleware } from "astro:middleware";
import verify from "../utils/jwt/verify";
import CookiesNames from "../utils/CookiesNames";

const PROTECTED_PATHS = [
  "/online",
  "/friends",
  "/online-game/*",
  "/api/friend-invite/*",
  "/api/friend-connection/*",
  "/api/friends",
  "/api/search-name-display-email/*",
];

const protect = defineMiddleware(({ url, cookies, redirect, locals }, next) => {
  try {
    const isProtected = isPathProtected(url.pathname);

    if (
      url.pathname.slice(0, 4) !== "/api" &&
      !isProtected &&
      url.pathname !== "/login" &&
      url.pathname !== "/register"
    ) {
      console.log("delete cookie");
      cookies.delete(CookiesNames.COOKIE_BACK_AFTER_LOGIN);
    }

    if (isProtected) {
      const token = cookies.get(CookiesNames.TOKEN_JWT)?.value;
      if (token === undefined) {
        cookies.set(CookiesNames.COOKIE_BACK_AFTER_LOGIN, url.pathname);
        return redirect("/login");
      }

      const verified = verify(token);

      if (verified === false) {
        cookies.delete(CookiesNames.TOKEN_JWT, { path: "/" });
        cookies.set(CookiesNames.COOKIE_BACK_AFTER_LOGIN, url.pathname);
        return redirect("/login");
      }
      locals.user = {
        id: verified.id,
      };
    }

    return next();
  } catch (err) {
    console.error(err);
    return next();
  }
});

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
