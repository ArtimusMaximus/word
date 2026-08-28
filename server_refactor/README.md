# Server Refactor

This folder is a separate Spring Boot/Maven workspace for the new backend.

Goals:

- keep the original `server/` module intact for comparison
- rebuild multiplayer state flow with clearer boundaries
- make room state, player turns, transport, and persistence separate concerns

Suggested direction for this refactor:

- `controller/` for HTTP endpoints
- `websocket/` for realtime transport only
- `service/` for application logic
- `store/` for in-memory room state storage
- `domain/` for room, player, and board models

We can keep this new server thin at first and grow it intentionally.

## Run locally

From the repository root:

```bash
cd server_refactor
mvn spring-boot:run
```

Then run `npm run dev` from the repository root. Do not start the Maven project in `server/` when testing `multi_player_refactor`; the original server does not expose `/api/rooms`.
