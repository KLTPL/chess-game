import { defineMiddleware } from "astro:middleware";
import getTranslation, {
  type Translation,
} from "../db/translations/getTranslation";

const addLanguageDict = defineMiddleware(
  async ({ url, request, locals }, next) => {
    try {
      if (url.pathname.slice(0, 4) === "/api") {
        return next();
      }
      const langDict = await getLangDict(
        url.pathname,
        request.headers.get("accept-language")
      );
      locals.langDict = langDict;
      return await next();
    } catch (err) {
      console.error(err);
      return next();
    }
  }
);

async function getLangDict(
  pathname: string,
  acceptLanguageHeader: string | null
): Promise<Record<string, Record<string, string>>> {
  const langDict: Record<string, Record<string, string>> = {};
  const prefLang = extractPreferredLanguage(acceptLanguageHeader);
  const lang = prefLang !== "en" ? "pl" : prefLang;

  const names = getDBTranslationNames(pathname);
  for (const name of names) {
    const translations = await getTranslation(name, lang);
    const dict = convertTranslationsToDict(translations);
    langDict[name.slice("translations_".length)] = dict;
  }
  return langDict;
}

function extractPreferredLanguage(acceptLanguageHeader: string | null) {
  if (acceptLanguageHeader === null) {
    return null;
  }
  const languages = acceptLanguageHeader
    .split(",")
    .map((language) => {
      const [languageTag, qValue] = language.trim().split(";q=");
      const primaryLanguage = languageTag.split("-")[0];
      return {
        languageTag: primaryLanguage,
        qValue: parseFloat(qValue || "1"),
      };
    })
    .sort((a, b) => b.qValue - a.qValue);

  return languages.length > 0 ? languages[0].languageTag : null;
}

function getDBTranslationNames(
  pathname: string
): (
  | "translations_navbar"
  | "translations_index"
  | "translations_game_list"
  | "translations_game_invite_receive"
  | "translations_online"
  | "translations_game_invite_create"
  | "translations_sign_in"
  | "translations_sign_up"
  | "translations_friends"
  | "translations_local"
  | "translations_game_end_info"
  | "translations_online_game"
)[] {
  // pathname format: "/[pathStart]/"
  const slashIdx = pathname.indexOf("/", 1);
  const pathnameStart = pathname.slice(
    1,
    slashIdx === -1 ? undefined : slashIdx
  );
  switch (pathnameStart) {
    case "": // index
      return [
        "translations_navbar",
        "translations_index",
        "translations_game_list",
        "translations_game_invite_create",
        "translations_game_invite_receive",
      ];
    case "online":
      return [
        "translations_navbar",
        "translations_online",
        "translations_game_list",
        "translations_game_invite_create",
      ];
    case "sign-in":
      return ["translations_navbar", "translations_sign_in"];
    case "sign-up":
      return ["translations_navbar", "translations_sign_up"];
    case "friends":
      return [
        "translations_navbar",
        "translations_friends",
        "translations_game_invite_create",
      ];
    case "local":
      return [
        "translations_navbar",
        "translations_local",
        "translations_game_end_info",
      ];
    case "online-game":
      return [
        "translations_navbar",
        "translations_online_game",
        "translations_game_end_info",
      ];
    case "game-invite-link":
      return [
        "translations_navbar",
        "translations_game_invite_receive",
        "translations_local",
        "translations_game_end_info",
      ];
  }
  return []; // should not happen
}

function convertTranslationsToDict(translations: Translation[]) {
  const dict: Record<string, string> = {};
  for (const tran of translations) {
    dict[tran.text_key] = tran.translated_text;
  }
  return dict;
}

export default addLanguageDict;
