# Spring Boot, TypeScript powered "Chic" style and themed Wordle game that allows replayability after the initial word of the day.

## Local development

The current multiplayer frontend uses the backend in `server_refactor/`. Start it from the repository root with:

```bash
cd server_refactor
mvn spring-boot:run
```

In a second terminal, start Vite from the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173/multi_player_refactor/`. Vite proxies API and WebSocket traffic to Spring Boot on port 1985, so local requests stay same-origin in the browser.

The original backend remains in `server/` for comparison, but it does not provide the refactored `/api/rooms` endpoints.

- **Note:** you must build the SQLite database upon fresh install as the DB is not portable on a fresh build. To do so, uncomment out these lines in ServerApplication.java: // SQLiteCreateTable.createWordTable("words"); // InsertWordsToDB.insertManyWords(AllWords.WORDS);

### View the demo here: https://word.es9.app
# Happy Wordling!
