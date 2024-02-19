import { defineMiddleware } from "astro:middleware";
import verify from "../utils/jwt/verify";

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

    if (isProtected) {
      const token = cookies.get("token")?.value;
      if (token === undefined) {
        return redirect("/login");
      }

      const verified = verify(token);

      if (!verified) {
        cookies.delete("token", { path: "/" });
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
