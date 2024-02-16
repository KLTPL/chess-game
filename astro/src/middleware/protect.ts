import { defineMiddleware } from "astro:middleware";
import verify from "../utils/jwt/verify";

const PROTECTED_PATHS = ["/online", "/online-game/*"];

const protect = defineMiddleware(({ url, cookies, redirect }, next) => {
  try {
    const isProtected = isPathProtected(url.pathname);

    if (isProtected) {
      const token = cookies.get("token")?.value;
      if (token === undefined) {
        return redirect("/login");
      }

      const isVerified = verify(token);

      if (!isVerified) {
        cookies.delete("token", { path: "/" });
        return redirect("/login");
      }
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
