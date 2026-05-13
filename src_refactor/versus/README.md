# Versus Refactor

This entry point is intentionally separate from `src_refactor/multi_player/main.ts`.

Planned responsibilities:

- lobby and ready state flow
- pre-round countdown
- local-only board rendering during active race
- large scrollable participant list
- race scoring and round results
- shared chat transport

Likely shared utilities to extract later:

- API and websocket URL helpers
- local player persistence
- toast rendering
- chat client lifecycle
- board and keyboard render helpers
