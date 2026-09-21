# chess-game

My chess game created in 2022 (client game) and updated in 2024 (back-end, api routes, login system, language system, online games, game invitations etc.)

## 🛠️ Tech Stack

- **TypeScript** everywhere — board logic, API routes, all of it
- **Astro** running the whole show: SSR pages, API endpoints, middleware
- **React** islands for the interactive bits — board, auth forms, live game lists
- **PostgreSQL** holding games, moves, users, and translations
- **Server-Sent Events** streaming moves in real time between opponents
- **JWT (RS256)** auth, **Tailwind CSS** for styling, **pnpm** keeping installs sane

## 📋 Requirements

- Git
- Node.js 24.x
- pnpm ≥9.0.0 (`.npmrc` enforces this; npm/yarn are blocked)
- Docker (for a local Postgres database)

## 🚀 Setup

1. Clone the project and install dependencies:

   ```bash
   git clone https://github.com/KLTPL/chess-game
   cd chess-game
   pnpm install
   ```

2. Create a `.env` file in the root:

   ```
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_APP_DATABASE=nestjs_db
   POSTGRES_SSL=false

   PRIVATE_KEY=privkey # the private key .pem file encoded in base 64
   PUBLIC_KEY=pubkey  # the public key .pem file encoded in base 64
   ```

   To generate the keys: put `id_rsa_priv.pem`/`id_rsa_pub.pem` in `/generate-keypair`, then run `node generate-keypair/encodeKeys.mjs` and paste the printed output into `.env`.

3. Start Postgres and load the schema:

   ```bash
   docker compose up -d
   ```

   Then run `/postgresql/main.sql` and `/postgresql/languages.sql` against the database.

## ⚡ Commands

| Command            | Action                                       |
| :----------------- | :-------------------------------------------- |
| `pnpm run dev`     | Starts local dev server at `localhost:4321`  |
| `pnpm run build`   | Build your production site to `./dist/`      |
| `pnpm run preview` | Preview your build locally, before deploying |
