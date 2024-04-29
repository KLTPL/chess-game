/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user:
      | undefined
      | {
          id: string;
        };
    langDict: Record<string, Record<string, string>>;
  }
}
