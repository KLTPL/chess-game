# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A chess web app built with Astro (server output mode) + React islands, TypeScript, Tailwind, and a raw-SQL PostgreSQL backend. It supports local (hotseat) games and online games with invites, friends, and live move streaming via SSE. The client-side chess engine (rules, board rendering, drag-and-drop) was originally built in 2022; the backend/auth/online-play layer was added in 2024.

## Commands

```bash
npm install        # install dependencies
npm run dev         # start dev server at localhost:4321
npm run build        # astro check (typecheck) && astro build
npm run preview       # preview the production build locally
```

There is no lint script, no ESLint config, and no test suite in this repo — `npm run build` (which runs `astro check`) is the only automated correctness check available.

### Local setup

- Requires a PostgreSQL database. Schema lives in `postgresql/main.sql` and `postgresql/languages.sql`; `postgresql/dev-data.sql` has seed data. A `docker-compose.yaml` may be available to spin up Postgres locally.
- Requires a `.env` file with `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_APP_DATABASE`, `PRIVATE_KEY`, `PUBLIC_KEY` (RSA keypair, base64-encoded — see `generate-keypair/`).

## Architecture

### Directory layout

- `src/pages/` — Astro pages (routing) and `src/pages/api/` — REST/SSE API routes, grouped by resource (`friend-connection`, `friend-invite`, `game-invite`, `game-invite-link`, `online-game`, `sign-in`, `sign-up`, etc.).
- `src/db/` — data access layer, one folder per DB entity (`app-user`, `game`, `game-halfmove`, `friend-connection`, `friend-invite`, `game-invite`, `game-invite-link`, `translations`, ...), each file a single query function (e.g. `src/db/app-user/getUser.ts`). `src/db/connect.ts` exposes a single `queryDB(query, values)` helper over a `pg.Pool`. `src/db/types.ts` defines the shared API request/response contract types (see naming convention below) plus the DB-backed enums (`PIECE_SYMBOLS`, `GAME_RESULTS_ID_DB`, `END_REASONS_ID_DB`).
- `src/middleware/` — Astro middleware sequence (`protect` → `addLanguageDict`). `protect.ts` reads the JWT cookie, verifies it, and populates `locals.user`; it also gates a hardcoded `PROTECTED_PATHS` list (redirecting to `/sign-in` for page routes, just passing through for API routes it can't redirect).
- `src/scripts-server/` — server-only helpers: `jwt/sign.ts` & `jwt/verify.ts` (RSA-signed JWTs), `hash-password/` (encrypt/validate), `onlineGameController.ts` (per-game `EventEmitter` singleton, keyed by `displayId`, used to fan out moves to SSE subscribers in `api/online-game/[display_id]/stream.ts`).
- `src/scripts-client/` — the chess engine and all client-side game logic, split MVC-style under `chess-classes/board/{model,view,controller}` and `chess-classes/pieces/{model,view}`:
  - `board/model/BoardModel.ts` + `MovesSystem.ts` + per-piece `model/*Model.ts` — board state, legal move generation, FEN parsing (`FENNotation.ts`).
  - `board/view/BoardView.ts`, `BoardHTMLFactory.ts`, `DragAndDropPieces.ts`, etc. — DOM rendering and interaction (not React — this is hand-rolled DOM manipulation, distinct from the React components under `src/components/`).
  - `board/controller/MatchController.ts` — orchestrates model + view; owns the `EventSource` connection for online games and reconciles incoming SSE move events (`handleStreamMessage`) against local optimistic moves (`skipNextStream` guards against double-applying a move you just made).
  - `initLocalGame.ts` / `initOnlineGame.ts` — entry points called from Astro pages/React components to bootstrap a `MatchController` for local vs. online play.
- `src/components/` — React components (auth forms, friends list, game invites, notifications, nav), used as Astro islands.
- `src/layouts/` — Astro layout shells.
- `src/utils/` — small cross-cutting helpers (e.g. `CookiesNames.ts` — single source of truth for cookie names).

### API type naming convention (`src/db/types.ts`)

Types follow `[IN_OR_OUT][ENDPOINT_TYPE][ROUTE_NAME]`:
- `API...` = request body shape, `APIResp...` = response shape.
- `ENDPOINT_TYPE` is `Get`/`Post`/`Put`/`Delete` (e.g. `APIPutGameInvite`).
- Example: `APIPostGameInviteLink` is the POST body for `/api/game-invite-link`.

### Auth & sessions

JWT stored in a cookie (name from `CookiesNames.ts`), signed/verified with an RSA keypair from env vars. `src/middleware/protect.ts` decodes the cookie on every request and sets `locals.user.id`; downstream pages/API routes read `Astro.locals.user` rather than re-verifying the token themselves.

### Online games (real-time)

Moves are persisted via `POST /api/online-game/[display_id]` and broadcast to other connected clients via `GET /api/online-game/[display_id]/stream` (SSE), backed by `OnlineGameController` (an in-memory per-process `EventEmitter`, keyed by `display_id`). This means real-time state is **not** shared across multiple server instances/processes — there's a single Node process assumption baked in.

### i18n

Translations are stored in Postgres (`postgresql/languages.sql`) and fetched per-request via `src/db/translations/getTranslation.ts` / `src/middleware/addLanguageDict.ts`, not static JSON files.

## Deployment

Configured for Vercel via `@astrojs/vercel/serverless` (see `astro.config.mjs`). Note `POSTGRES_APP_DATABASE` is named that way (not `POSTGRES_DATABASE`) specifically to avoid colliding with a Vercel-reserved env var name.
