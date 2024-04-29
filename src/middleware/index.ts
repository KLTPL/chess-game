import { sequence } from "astro:middleware";
import protect from "./protect";
import addLanguageDict from "./addLanguageDict";

export const onRequest = sequence(protect, addLanguageDict);
