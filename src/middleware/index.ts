import { sequence } from "astro:middleware";
import protect from "./protect";

export const onRequest = sequence(protect);
