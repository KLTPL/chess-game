import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: vercel(),
  env: {
    schema: {
      POSTGRES_USER: envField.string({ context: "server", access: "secret" }),
      POSTGRES_PASSWORD: envField.string({ context: "server", access: "secret" }),
      POSTGRES_HOST: envField.string({ context: "server", access: "secret" }),
      POSTGRES_PORT: envField.string({ context: "server", access: "secret" }),
      POSTGRES_APP_DATABASE: envField.string({ context: "server", access: "secret" }),
      POSTGRES_SSL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        default: "true",
      }),
      PRIVATE_KEY: envField.string({ context: "server", access: "secret" }),
      PUBLIC_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
});
