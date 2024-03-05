/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user:
      | undefined
      | {
          id: string;
        };
  }
}
