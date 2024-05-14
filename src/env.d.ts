/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user:
      | undefined
      | {
          id: string;
        };
    lang: "pl" | "en";
    langDict: Record<string, Record<string, string>>;
  }
}
