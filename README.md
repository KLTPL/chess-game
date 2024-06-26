# chess-game

My chess game created in 2022 (client game)

and updated in 2024 (back-end, api routes, login system, language system, online games, game invitations etc.)

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

Make sure you have git installed on your local machine.

If not you can head on to https://git-scm.com/downloads.

### 2. Install npm

Make sure you have npm (node package manager) installed on your local machine.

If not you can head on to https://nodejs.org/en/download and download node.

### 3. Install postgresql

If you want to develop localy, make sure you have the postgresql database installed on your local machine.

If not you can head on to https://www.postgresql.org/download/.

### 4. Create your local database

After configuring the postgresql installation create a database for the project and insert all tables from the /postgresql/main.sql and /postgresql/languages.sql files.

### 5. Clone the project

Run this command in your terminal in the directory where you want the project to go to.

```bash
git clone https://github.com/KLTPL/chess-game
```

### 6. Install dependencies

Enter the newly created folder

```bash
cd chess-game
```

Install node dependencies

```bash
npm install
```

### 7. Enviremental variables

The application needs a .env file in the root directory in order to work properly.

A template for your .env file (all required):

```
POSTGRES_USER= # database user
POSTGRES_PASSWORD= # database password
POSTGRES_HOST= # database host
POSTGRES_APP_DATABASE= # database database name
PRIVATE_KEY= # the private key .pem file encoded in base 64
PUBLIC_KEY= # the public key .pem file encoded in base 64
```

The code for encoding both private and public key is in the /generate-keypair directory.
Create id_rsa_priv.pem and id_rsa_pub.pem files in that directory and run the encodeKeys.mjs file.

```bash
node generate-keypair\encodeKeys.mjs
```

Converted keys will be printed to the console.

## Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Installs dependencies                        |
| `npm run dev`     | Starts local dev server at `localhost:4321`  |
| `npm run build`   | Build your production site to `./dist/`      |
| `npm run preview` | Preview your build locally, before deploying |

## Hosting:

- the 2022 version hosted on firebase: https://chess-game-52e8e.web.app
