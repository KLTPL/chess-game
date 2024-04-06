# chess-game

My chess game created in 2022 (client game)

and updated in 2024 (back-end, api routes, login system, online games, invites etc.)

## Technologies Used

- **Main Language**: Typescript
- **Bundler**: Astro
- **Main front-end framework**: React
- **Database**: Postgresql

## Project Structure

Important (but not all) files and folders inside the project:

```text
/
├── postgresql/
│   └── main.sql
├── public/
├── src/
│   ├──components/
│   ├── db/
│   ├── images/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   │   ├── api/
│   │   ├── game-invite/
│   │   ├── online-game/
│   │   └── index.astro
│   ├── scripts/
│   │   ├── chess-classes/
│   │   │   ├── board/
│   │   │   └── pieces/
│   │   ├── initLocalGame.ts
│   │   └── initOnlineGame.ts
│   ├── styles/
│   │   └── Board.css
│   └── utils/
├── .prettierrc
├── package.json
├── astro.config.mjs
└── tailwind.config.mjs
```

## To run the project localy:

### 1. Install git

Make sure you have git installed.

If not you can head on to https://git-scm.com/downloads.

### 2. Install npm

Make sure you have npm (node package manager) installed.

If not you can head on to https://nodejs.org/en/download and download node.

### 3. Clone the project

Run this command in your terminal in the directory where you want the project to go to.

```bash
git clone https://github.com/KLTPL/chess-game
```

### 4. Install dependencies

Enter the newly created folder

```bash
cd chess-game
```

Install node dependencies

```bash
npm install
```

## Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## Enviremental variables

The application needs a .env file in the root directory in order to work properly.

A template for your .env file (all required):

```
PSQL_USER= # database user
PSQL_PASSWORD= # database password
PSQL_PORT= # database port
PSQL_DATABASE= # database database name
PSQL_HOST= # database host
PUBLIC_SERVER_URL= # server url used on the client
```

## Hosting:

- the 2022 version hosted on firebase: https://chess-game-52e8e.web.app
