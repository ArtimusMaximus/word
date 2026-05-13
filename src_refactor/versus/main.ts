type VersusPlayerState = {
  playerId: string;
  username: string;
  connected: boolean;
  ready: boolean;
  roundWins: number;
  totalWins: number;
  status: string;
};

type BoardCell = {
  letter: string;
  status: string;
};

type VersusRoomSnapshot = {
  roomId: string;
  wordLength: number;
  maxRows: number;
  status: string;
  maxPlayers: number;
  roundNumber: number;
  countdownSeconds: number;
  countdownStartedAtEpochMillis: number;
  readyPlayerCount: number;
  players: VersusPlayerState[];
  winnerPlayerId: string | null;
  debugWord: string;
};

type VersusGuessResponse = {
  validGuess: boolean;
  solved: boolean;
  message: string | null;
  evaluatedCells: BoardCell[];
  snapshot: VersusRoomSnapshot;
};

type LocalBoardState = {
  rows: BoardCell[][];
  activeRowIndex: number;
  currentGuess: string;
  keyboard: Record<string, string>;
  solved: boolean;
  exhausted: boolean;
};

const app = document.getElementById("app");
const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = isLocalDev ? "http://localhost:1985" : "";
const USERNAME_KEY = "versus-user";
const MEMBERSHIP_KEY = "versus-room-memberships";
const RECENT_ROOM_KEY = "versus-recent-room";
const USERNAME_MAX_LENGTH = 15;
const DEFAULT_KEYBOARD_CLASS = "kbd text-pink-200 bg-black h-20";
const DEFAULT_ENTER_CLASS = "kbd text-pink-200 bg-black h-20";
const DEFAULT_BACKSPACE_CLASS = "kbd text-pink-200 bg-black font-bold w-16 sm:w-[73px] h-20";

let latestSnapshot: VersusRoomSnapshot | null = null;
let currentRoomId: string | null = null;
let pollTimer: number | null = null;
let localBoardState: LocalBoardState | null = null;
let localBoardKey: string | null = null;
let keyboardEventsBound = false;

function ensureLocalPlayer() {
  const stored = localStorage.getItem(USERNAME_KEY);
  if (stored) {
    return JSON.parse(stored) as { username: string };
  }

  const player = { username: `Player${Math.floor(Math.random() * 900 + 100)}` };
  localStorage.setItem(USERNAME_KEY, JSON.stringify(player));
  return player;
}

function setLocalUsername(username: string) {
  const trimmed = username.trim().slice(0, USERNAME_MAX_LENGTH);
  if (!trimmed) {
    throw new Error("Username is required");
  }
  const player = { username: trimmed };
  localStorage.setItem(USERNAME_KEY, JSON.stringify(player));
  return player;
}

function getRoomIdFromUrl() {
  return new URLSearchParams(window.location.search).get("room");
}

function setMembership(roomId: string, playerId: string) {
  const existing = localStorage.getItem(MEMBERSHIP_KEY);
  const memberships = existing ? JSON.parse(existing) as Record<string, string> : {};
  memberships[roomId] = playerId;
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(memberships));
}

function getMembership(roomId: string) {
  const existing = localStorage.getItem(MEMBERSHIP_KEY);
  if (!existing) {
    return null;
  }
  const memberships = JSON.parse(existing) as Record<string, string>;
  return memberships[roomId] ?? null;
}

function clearMembership(roomId: string) {
  const existing = localStorage.getItem(MEMBERSHIP_KEY);
  if (!existing) {
    return;
  }
  const memberships = JSON.parse(existing) as Record<string, string>;
  delete memberships[roomId];
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(memberships));
}

function setRecentRoom(roomId: string) {
  localStorage.setItem(RECENT_ROOM_KEY, roomId);
}

function getRecentRoom() {
  return localStorage.getItem(RECENT_ROOM_KEY);
}

function generateRoomId() {
  return `versus_${Math.random().toString(36).slice(2, 11)}`;
}

function createEmptyBoard(wordLength: number, maxRows: number): LocalBoardState {
  return {
    rows: Array.from({ length: maxRows }, () =>
      Array.from({ length: wordLength }, () => ({ letter: "", status: "empty" })),
    ),
    activeRowIndex: 0,
    currentGuess: "",
    keyboard: {},
    solved: false,
    exhausted: false,
  };
}

function syncLocalBoard(snapshot: VersusRoomSnapshot) {
  const nextKey = `${snapshot.roomId}:${snapshot.roundNumber}`;
  if (localBoardKey !== nextKey) {
    localBoardKey = nextKey;
    localBoardState = createEmptyBoard(snapshot.wordLength, snapshot.maxRows);
  }

  if (!localBoardState) {
    localBoardState = createEmptyBoard(snapshot.wordLength, snapshot.maxRows);
  }

  if (snapshot.status !== "ROUND_ACTIVE" && snapshot.status !== "COUNTDOWN" && snapshot.status !== "ROUND_COMPLETE") {
    return;
  }

  const localPlayer = findLocalPlayer(snapshot);
  if (snapshot.status === "ROUND_COMPLETE") {
    localBoardState.solved = snapshot.winnerPlayerId === localPlayer?.playerId;
  }
}

async function fetchJson<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  if (response.status === 204) {
    return null as T;
  }
  return await response.json() as T;
}

function findLocalPlayer(snapshot: VersusRoomSnapshot) {
  const membership = getMembership(snapshot.roomId);
  return membership ? snapshot.players.find((player) => player.playerId === membership) ?? null : null;
}

function boardMarkup(wordLength: number, maxRows: number) {
  let markup = "";
  for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
    for (let colIndex = 0; colIndex < wordLength; colIndex++) {
      markup += `<div id="cell-${rowIndex}-${colIndex}" class="word-row bg-black row-start-${rowIndex + 1} w-[56px] h-[56px] sm:w-16 sm:h-16 flex items-center border-2 sm:border-3 border-white justify-center text-3xl sm:text-4xl font-bold text-pink-300"></div>`;
    }
  }
  return markup;
}

function showToast(message: string, tone: "info" | "error" = "info", duration = 2600) {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) {
    return;
  }
  const toast = document.createElement("div");
  toast.className = tone === "error"
    ? "alert border border-red-500 bg-white text-red-500 shadow-lg"
    : "alert border border-pink-300 bg-white text-black shadow-lg";
  toast.innerHTML = `<span class="font-bold">${message}</span>`;
  toastContainer.appendChild(toast);
  window.setTimeout(() => toast.remove(), duration);
}

async function fetchRoom(roomId: string) {
  return await fetchJson<VersusRoomSnapshot>(`${API_URL}/api/versus/rooms/${roomId}`);
}

async function postJson<T>(url: string, payload: unknown) {
  return await fetchJson<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function captureMembership(snapshot: VersusRoomSnapshot, username: string) {
  const player = snapshot.players.find((candidate) => candidate.username === username);
  if (player) {
    setMembership(snapshot.roomId, player.playerId);
  }
}

function renderLanding(defaultRoomId = getRecentRoom() ?? generateRoomId(), invited = false) {
  stopPolling();
  latestSnapshot = null;
  currentRoomId = null;
  localBoardState = null;
  localBoardKey = null;
  const currentUser = ensureLocalPlayer();
  if (!app) {
    return;
  }

  app.innerHTML = `
    <div id="toastContainer" class="toast toast-top toast-center z-50"></div>
    <div class="flex flex-col gap-6">
      <div class="bg-transparent p-1 sm:p-4 flex flex-row items-center justify-start">
        <h1 class="text-2xl sm:text-4xl font-bold text-center text-black italic mx-auto">WORDLE</h1>
      </div>

      <div class="bg-white/80 border border-black rounded-md p-6 text-center text-black">
        <p class="text-lg font-bold">Versus Mode</p>
        <p class="mt-2 italic">${invited ? "Choose your username and join the versus room." : "Create a race room or jump back into a recent one."}</p>
        ${!invited && defaultRoomId ? `<p class="mt-3 text-sm italic text-black/70">Recent room: <span class="font-bold lowercase">${defaultRoomId}</span></p>` : ""}
        <div class="mt-6 flex flex-col items-center gap-3">
          <input id="versus-username-input" class="input input-bordered bg-white text-black" value="${currentUser.username}" maxlength="${USERNAME_MAX_LENGTH}" placeholder="username" />
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input id="versus-room-input" class="input input-bordered bg-white text-center font-bold lowercase text-black ${invited ? "hidden" : ""}" value="${defaultRoomId}" placeholder="room id" />
            ${invited ? `<div class="flex items-center justify-center rounded-md border border-black bg-white px-4 py-3 font-bold lowercase text-black">${defaultRoomId}</div>` : ""}
            <button id="versus-create-room-btn" class="btn bg-black text-pink-300">Create Versus Room</button>
            <button id="versus-join-room-btn" class="btn bg-white text-black border border-black">${invited ? "Join Room" : "Join Existing Room"}</button>
          </div>
        </div>
        <div class="mt-6 flex justify-center">
          <a href="../" class="btn bg-white text-black border border-black">Home</a>
        </div>
      </div>
    </div>
  `;

  bindLandingEvents();
}

function renderLobby(snapshot: VersusRoomSnapshot) {
  latestSnapshot = snapshot;
  currentRoomId = snapshot.roomId;
  setRecentRoom(snapshot.roomId);
  window.history.replaceState({}, "", `${window.location.pathname}?room=${snapshot.roomId}`);
  syncLocalBoard(snapshot);

  const localPlayer = findLocalPlayer(snapshot);
  const localReady = localPlayer?.ready ?? false;
  const winner = snapshot.winnerPlayerId
    ? snapshot.players.find((player) => player.playerId === snapshot.winnerPlayerId) ?? null
    : null;

  if (!app || !localBoardState) {
    return;
  }

  app.innerHTML = `
    <div id="toastContainer" class="toast toast-top toast-center z-50"></div>
    <div class="flex flex-col gap-6">
      <div class="bg-transparent p-1 sm:p-4 flex flex-row items-center justify-start">
        <h1 class="text-2xl sm:text-4xl font-bold text-center text-black italic mx-auto">WORDLE</h1>
      </div>

      <div class="bg-white/80 border border-black rounded-md p-6 text-black">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="text-2xl font-bold">Versus Lobby</div>
            <div class="mt-2 italic text-black/70">Room <span class="font-bold lowercase">${snapshot.roomId}</span></div>
          </div>
          <div class="flex flex-col gap-2 sm:items-end">
            <span class="rounded-full border border-pink-300 bg-white px-4 py-2 text-sm font-bold text-pink-300">${snapshot.status.split("_").join(" ")}</span>
            <span class="text-sm text-black/70">${snapshot.readyPlayerCount}/${snapshot.players.length} ready</span>
          </div>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <div class="rounded-md border border-black bg-black/90 p-4 text-pink-200">
            <div class="text-sm uppercase tracking-[0.2em] text-pink-200/70">Round</div>
            <div class="mt-3 text-3xl font-bold text-white">${snapshot.roundNumber}</div>
          </div>
          <div class="rounded-md border border-black bg-white p-4">
            <div class="text-sm uppercase tracking-[0.2em] text-black/60">Countdown</div>
            <div class="mt-3 text-3xl font-bold text-black">${snapshot.countdownSeconds}s</div>
            <div class="mt-2 text-sm text-black/70">${snapshot.status === "COUNTDOWN" ? "Countdown is live." : snapshot.status === "ROUND_ACTIVE" ? "Race is active." : snapshot.status === "ROUND_COMPLETE" ? "Round is finished." : "Waiting for players to ready up."}</div>
          </div>
          <div class="rounded-md border border-black bg-white p-4">
            <div class="text-sm uppercase tracking-[0.2em] text-black/60">Scoring</div>
            <div class="mt-3 text-3xl font-bold text-black">+1</div>
            <div class="mt-2 text-sm text-black/70">First solver wins the round point.</div>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="text-sm italic text-black/70">${winner ? `<span class="font-bold text-black">${winner.username}</span> won round ${snapshot.roundNumber}.` : "Your board is private. Only the winner and lobby state are shared."}</div>
          <div class="flex flex-wrap gap-2">
            <button id="versus-copy-link-btn" class="btn btn-sm bg-white text-black border border-black">Copy Room Link</button>
            <button id="versus-rename-btn" class="btn btn-sm bg-white text-black border border-black">Update Username</button>
            <button id="versus-refresh-btn" class="btn btn-sm bg-white text-black border border-black">Refresh Now</button>
            <button id="versus-ready-btn" class="btn btn-sm ${localReady ? "bg-pink-300 text-black" : "bg-black text-pink-300"}">${localReady ? "Unready" : "Ready Up"}</button>
            ${snapshot.status === "ROUND_COMPLETE" ? `<button id="versus-next-round-btn" class="btn btn-sm bg-pink-300 text-black border border-black">Next Round</button>` : ""}
            <button id="versus-leave-btn" class="btn btn-sm bg-white text-black border border-black">Leave Room</button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section class="bg-white/80 border border-black rounded-md p-5 text-black">
          <div class="flex items-center justify-between">
            <div class="font-bold text-xl">Your Board</div>
            <span class="text-xs uppercase tracking-[0.18em] text-black/60">${snapshot.status === "ROUND_ACTIVE" ? "Live" : snapshot.status === "COUNTDOWN" ? "Locked" : "Standby"}</span>
          </div>
          <div id="versus-board-status" class="mt-2 text-sm italic text-black/70">${getBoardStatusText(snapshot, localBoardState)}</div>
          <div id="versus-board-wrapper" class="mt-4">
            <div id="mainTainer" class="grid grid-rows-6 grid-cols-5 place-items-center mx-auto gap-none sm:gap-1 w-fit">
              ${boardMarkup(snapshot.wordLength, snapshot.maxRows)}
            </div>
            <div class="w-full pt-2 sm:mt-10">
              <div class="my-1 flex justify-center gap-[1px] sm:gap-1 sm:text-xl font-bold select-none">
                <kbd data-key="Q" class="${DEFAULT_KEYBOARD_CLASS}">Q</kbd>
                <kbd data-key="W" class="${DEFAULT_KEYBOARD_CLASS}">W</kbd>
                <kbd data-key="E" class="${DEFAULT_KEYBOARD_CLASS}">E</kbd>
                <kbd data-key="R" class="${DEFAULT_KEYBOARD_CLASS}">R</kbd>
                <kbd data-key="T" class="${DEFAULT_KEYBOARD_CLASS}">T</kbd>
                <kbd data-key="Y" class="${DEFAULT_KEYBOARD_CLASS}">Y</kbd>
                <kbd data-key="U" class="${DEFAULT_KEYBOARD_CLASS}">U</kbd>
                <kbd data-key="I" class="${DEFAULT_KEYBOARD_CLASS}">I</kbd>
                <kbd data-key="O" class="${DEFAULT_KEYBOARD_CLASS}">O</kbd>
                <kbd data-key="P" class="${DEFAULT_KEYBOARD_CLASS}">P</kbd>
              </div>
              <div class="my-1 flex w-full justify-center gap-[1px] sm:gap-1 sm:text-xl font-bold select-none">
                <kbd data-key="A" class="${DEFAULT_KEYBOARD_CLASS}">A</kbd>
                <kbd data-key="S" class="${DEFAULT_KEYBOARD_CLASS}">S</kbd>
                <kbd data-key="D" class="${DEFAULT_KEYBOARD_CLASS}">D</kbd>
                <kbd data-key="F" class="${DEFAULT_KEYBOARD_CLASS}">F</kbd>
                <kbd data-key="G" class="${DEFAULT_KEYBOARD_CLASS}">G</kbd>
                <kbd data-key="H" class="${DEFAULT_KEYBOARD_CLASS}">H</kbd>
                <kbd data-key="J" class="${DEFAULT_KEYBOARD_CLASS}">J</kbd>
                <kbd data-key="K" class="${DEFAULT_KEYBOARD_CLASS}">K</kbd>
                <kbd data-key="L" class="${DEFAULT_KEYBOARD_CLASS}">L</kbd>
              </div>
              <div class="my-1 flex w-full justify-center gap-[1px] sm:gap-1 sm:text-xl font-bold select-none">
                <kbd id="enter" class="${DEFAULT_ENTER_CLASS}">Enter</kbd>
                <kbd data-key="Z" class="${DEFAULT_KEYBOARD_CLASS}">Z</kbd>
                <kbd data-key="X" class="${DEFAULT_KEYBOARD_CLASS}">X</kbd>
                <kbd data-key="C" class="${DEFAULT_KEYBOARD_CLASS}">C</kbd>
                <kbd data-key="V" class="${DEFAULT_KEYBOARD_CLASS}">V</kbd>
                <kbd data-key="B" class="${DEFAULT_KEYBOARD_CLASS}">B</kbd>
                <kbd data-key="N" class="${DEFAULT_KEYBOARD_CLASS}">N</kbd>
                <kbd data-key="M" class="${DEFAULT_KEYBOARD_CLASS}">M</kbd>
                <kbd id="backspace" class="${DEFAULT_BACKSPACE_CLASS}">&lBarr;</kbd>
              </div>
            </div>
          </div>
        </section>

        <aside class="bg-white/80 border border-black rounded-md p-5 text-black">
          <div class="flex items-center justify-between">
            <div class="font-bold text-xl">Player List</div>
            <span class="text-xs uppercase tracking-[0.18em] text-black/60">50+ Ready</span>
          </div>
          <div class="mt-4 max-h-[520px] overflow-y-auto rounded-md border border-black/20 bg-white">
            ${snapshot.players.map((player) => {
              const isLocal = localPlayer?.playerId === player.playerId;
              const isWinner = snapshot.winnerPlayerId === player.playerId;
              return `
                <div class="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3 last:border-b-0 ${isLocal ? "bg-pink-50" : ""}">
                  <div class="min-w-0">
                    <div class="truncate font-bold text-black">${player.username}${isLocal ? " (You)" : ""}</div>
                    <div class="mt-1 flex flex-wrap gap-2 text-xs">
                      <span class="rounded-full border ${player.ready ? "border-pink-300 bg-pink-100 text-black" : "border-black/20 bg-white text-black/60"} px-3 py-1 font-bold">${player.ready ? "Ready" : "Waiting"}</span>
                      <span class="rounded-full border border-black/20 bg-white px-3 py-1 text-black/70">${player.status}</span>
                      ${isWinner ? `<span class="rounded-full border border-green-300 bg-green-100 px-3 py-1 font-bold text-black">Winner</span>` : ""}
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold text-black">${player.roundWins} round</div>
                    <div class="text-xs text-black/70">${player.totalWins} total</div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </aside>
      </div>
    </div>
  `;

  applyLocalBoardToDom(snapshot);
  bindLobbyEvents();
  bindBoardInput();
  console.log("Versus room word:", snapshot.debugWord);
}

function getBoardStatusText(snapshot: VersusRoomSnapshot, board: LocalBoardState) {
  if (snapshot.status === "COUNTDOWN") {
    return "Get ready. The race starts when the countdown hits zero.";
  }
  if (snapshot.status === "ROUND_ACTIVE") {
    if (board.solved) {
      return "You solved it. Waiting for the room to settle the round.";
    }
    if (board.exhausted) {
      return "You ran out of guesses for this round.";
    }
    return "Race is live. Your guesses stay private until someone wins.";
  }
  if (snapshot.status === "ROUND_COMPLETE") {
    return snapshot.winnerPlayerId ? "Round complete. Ready up for the next one." : "Round complete.";
  }
  return "Ready up when you want to start racing.";
}

function getCellClasses(status: string) {
  const base = "word-row w-[56px] h-[56px] sm:w-16 sm:h-16 flex items-center border-2 sm:border-3 justify-center text-3xl sm:text-4xl font-bold";
  switch (status) {
    case "correct":
      return `${base} bg-green-200 border-green-200 text-black`;
    case "present":
      return `${base} bg-yellow-200 border-yellow-200 text-black`;
    case "miss":
      return `${base} bg-slate-500 border-slate-500 text-white`;
    default:
      return `${base} bg-black border-white text-pink-300`;
  }
}

function getKeyboardClasses(letter: string, status: string | undefined) {
  const base = letter === "ENTER"
    ? "kbd bg-black text-pink-200 h-20"
    : letter === "BACKSPACE"
      ? "kbd bg-black text-pink-200 font-bold w-16 sm:w-[73px] h-20"
      : "kbd bg-black text-pink-200 h-20";
  if (status === "correct") return `${base} bg-green-200 text-black`;
  if (status === "present") return `${base} bg-yellow-200 text-black`;
  if (status === "miss") return `${base} bg-slate-500 text-white`;
  return base;
}

function applyLocalBoardToDom(snapshot: VersusRoomSnapshot) {
  if (!localBoardState) {
    return;
  }

  localBoardState.rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const element = document.getElementById(`cell-${rowIndex}-${colIndex}`);
      if (!element) {
        return;
      }
      element.className = getCellClasses(cell.status);
      element.textContent = cell.letter;
    });
  });

  document.querySelectorAll<HTMLElement>(".kbd").forEach((element) => {
    const keyValue = element.dataset.key?.toUpperCase()
      ?? (element.id === "enter" ? "ENTER" : element.id === "backspace" ? "BACKSPACE" : element.textContent?.trim().toUpperCase() ?? "");
    if (!keyValue) {
      return;
    }
    const status = keyValue === "ENTER" || keyValue === "BACKSPACE" ? undefined : localBoardState!.keyboard[keyValue];
    element.className = getKeyboardClasses(keyValue, status);
    element.style.color = status === "correct" || status === "present" ? "black" : status === "miss" ? "white" : "";
  });

  const status = document.getElementById("versus-board-status");
  if (status) {
    status.textContent = getBoardStatusText(snapshot, localBoardState);
  }
}

function bindLandingEvents() {
  document.getElementById("versus-create-room-btn")?.addEventListener("click", async () => {
    try {
      const usernameInput = document.getElementById("versus-username-input") as HTMLInputElement | null;
      const localPlayer = setLocalUsername(usernameInput?.value ?? "");
      const roomId = generateRoomId();
      const snapshot = await postJson<VersusRoomSnapshot>(`${API_URL}/api/versus/rooms`, {
        roomId,
        hostUsername: localPlayer.username,
      });
      captureMembership(snapshot, localPlayer.username);
      renderLobby(snapshot);
      startPolling(snapshot.roomId);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to create versus room", "error", 4000);
    }
  });

  document.getElementById("versus-join-room-btn")?.addEventListener("click", async () => {
    try {
      const usernameInput = document.getElementById("versus-username-input") as HTMLInputElement | null;
      const localPlayer = setLocalUsername(usernameInput?.value ?? "");
      const invitedRoomId = getRoomIdFromUrl();
      const roomInput = document.getElementById("versus-room-input") as HTMLInputElement | null;
      const roomId = invitedRoomId ?? roomInput?.value?.trim();
      if (!roomId) {
        throw new Error("Room ID is required");
      }

      const existingSnapshot = await fetchRoom(roomId);
      const existingMembership = getMembership(roomId);
      const membershipStillExists = existingMembership
        ? existingSnapshot.players.some((player) => player.playerId === existingMembership)
        : false;

      const snapshot = membershipStillExists
        ? existingSnapshot
        : await postJson<VersusRoomSnapshot>(`${API_URL}/api/versus/rooms/${roomId}/join`, {
            username: localPlayer.username,
          });

      captureMembership(snapshot, localPlayer.username);
      renderLobby(snapshot);
      startPolling(snapshot.roomId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to join versus room";
      if (message.includes("(404)")) {
        showToast("That versus room does not exist. Create a new room instead.", "error", 4000);
        return;
      }
      showToast(message, "error", 4000);
    }
  });
}

function bindLobbyEvents() {
  document.getElementById("versus-copy-link-btn")?.addEventListener("click", async () => {
    if (!latestSnapshot) {
      return;
    }
    const link = `${window.location.origin}/versus_refactor/?room=${latestSnapshot.roomId}`;
    await navigator.clipboard.writeText(link);
    showToast("Versus room link copied.");
  });

  document.getElementById("versus-refresh-btn")?.addEventListener("click", async () => {
    if (!latestSnapshot) {
      return;
    }
    const snapshot = await fetchRoom(latestSnapshot.roomId);
    renderLobby(snapshot);
  });

  document.getElementById("versus-ready-btn")?.addEventListener("click", async () => {
    if (!latestSnapshot) {
      return;
    }
    if (latestSnapshot.status === "ROUND_ACTIVE" || latestSnapshot.status === "ROUND_COMPLETE") {
      showToast("Wait for the next round before changing ready state.", "error", 3000);
      return;
    }
    const localPlayer = findLocalPlayer(latestSnapshot);
    if (!localPlayer) {
      return;
    }
    const snapshot = await postJson<VersusRoomSnapshot>(`${API_URL}/api/versus/rooms/${latestSnapshot.roomId}/ready`, {
      playerId: localPlayer.playerId,
      ready: !localPlayer.ready,
    });
    renderLobby(snapshot);
  });

  document.getElementById("versus-rename-btn")?.addEventListener("click", async () => {
    if (!latestSnapshot) {
      return;
    }
    const localPlayer = findLocalPlayer(latestSnapshot);
    if (!localPlayer) {
      return;
    }
    const nextUsername = window.prompt("Update your username", localPlayer.username);
    if (nextUsername == null) {
      return;
    }
    const updatedUser = setLocalUsername(nextUsername);
    const snapshot = await postJson<VersusRoomSnapshot>(`${API_URL}/api/versus/rooms/${latestSnapshot.roomId}/rename`, {
      playerId: localPlayer.playerId,
      username: updatedUser.username,
    });
    captureMembership(snapshot, updatedUser.username);
    renderLobby(snapshot);
  });

  document.getElementById("versus-next-round-btn")?.addEventListener("click", async () => {
    if (!latestSnapshot) {
      return;
    }
    const snapshot = await postJson<VersusRoomSnapshot>(`${API_URL}/api/versus/rooms/${latestSnapshot.roomId}/next-round`, {});
    renderLobby(snapshot);
    showToast("Next round is ready.");
  });

  document.getElementById("versus-leave-btn")?.addEventListener("click", async () => {
    if (!latestSnapshot) {
      return;
    }
    const localPlayer = findLocalPlayer(latestSnapshot);
    if (!localPlayer) {
      renderLanding();
      return;
    }
    await postJson<void>(`${API_URL}/api/versus/rooms/${latestSnapshot.roomId}/leave`, {
      playerId: localPlayer.playerId,
    });
    clearMembership(latestSnapshot.roomId);
    window.history.replaceState({}, "", window.location.pathname);
    renderLanding();
  });
}

function bindBoardInput() {
  if (keyboardEventsBound) {
    return;
  }

  document.addEventListener("keydown", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.id === "versus-username-input" || target?.id === "versus-room-input") {
      return;
    }
    const normalized = normalizeKeyboardInput(event.key);
    if (!normalized) {
      return;
    }
    void handleBoardInput(normalized);
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (!target?.classList.contains("kbd")) {
      return;
    }
    const normalized = target.dataset.key?.toUpperCase()
      ?? (target.id === "enter" ? "ENTER" : target.id === "backspace" ? "BACKSPACE" : null);
    if (normalized) {
      void handleBoardInput(normalized);
    }
  });

  keyboardEventsBound = true;
}

function normalizeKeyboardInput(keyValue: string) {
  const upperKey = keyValue.toUpperCase();
  if (upperKey === "BACKSPACE") return "BACKSPACE";
  if (upperKey === "ENTER") return "ENTER";
  if (upperKey.length === 1 && upperKey >= "A" && upperKey <= "Z") return upperKey;
  return null;
}

async function handleBoardInput(input: string) {
  if (!latestSnapshot || !localBoardState) {
    return;
  }
  if (latestSnapshot.status !== "ROUND_ACTIVE") {
    return;
  }
  if (localBoardState.solved || localBoardState.exhausted) {
    return;
  }

  if (input === "BACKSPACE") {
    if (!localBoardState.currentGuess) {
      return;
    }
    localBoardState.currentGuess = localBoardState.currentGuess.slice(0, -1);
    renderCurrentGuessRow(latestSnapshot.wordLength);
    return;
  }

  if (input === "ENTER") {
    await submitCurrentGuess();
    return;
  }

  if (localBoardState.currentGuess.length >= latestSnapshot.wordLength) {
    return;
  }

  localBoardState.currentGuess += input;
  renderCurrentGuessRow(latestSnapshot.wordLength);
}

function renderCurrentGuessRow(wordLength: number) {
  if (!localBoardState) {
    return;
  }

  const rowIndex = localBoardState.activeRowIndex;
  const currentRow = localBoardState.rows[rowIndex];
  if (!currentRow) {
    return;
  }

  for (let colIndex = 0; colIndex < wordLength; colIndex++) {
    currentRow[colIndex] = {
      letter: localBoardState.currentGuess[colIndex] ?? "",
      status: "empty",
    };
  }

  if (latestSnapshot) {
    applyLocalBoardToDom(latestSnapshot);
  }
}

function updateKeyboardStatus(letter: string, status: string) {
  if (!localBoardState) {
    return;
  }
  const currentStatus = localBoardState.keyboard[letter];
  const priority: Record<string, number> = { empty: 0, miss: 1, present: 2, correct: 3 };
  if (!currentStatus || priority[status] > priority[currentStatus]) {
    localBoardState.keyboard[letter] = status;
  }
}

function wiggleCurrentRow(wordLength: number) {
  if (!localBoardState) {
    return;
  }
  const rowIndex = localBoardState.activeRowIndex;
  for (let colIndex = 0; colIndex < wordLength; colIndex++) {
    const cell = document.getElementById(`cell-${rowIndex}-${colIndex}`);
    cell?.classList.add("animate-wiggle");
    window.setTimeout(() => cell?.classList.remove("animate-wiggle"), 750);
  }
}

async function submitCurrentGuess() {
  if (!latestSnapshot || !localBoardState) {
    return;
  }

  const localPlayer = findLocalPlayer(latestSnapshot);
  if (!localPlayer) {
    return;
  }

  if (localBoardState.currentGuess.length !== latestSnapshot.wordLength) {
    showToast("Guess must be 5 letters.", "error", 2200);
    return;
  }

  const response = await postJson<VersusGuessResponse>(`${API_URL}/api/versus/rooms/${latestSnapshot.roomId}/guess`, {
    playerId: localPlayer.playerId,
    guess: localBoardState.currentGuess,
  });

  latestSnapshot = response.snapshot;
  currentRoomId = response.snapshot.roomId;
  syncLocalBoard(response.snapshot);

  if (!response.validGuess) {
    wiggleCurrentRow(response.snapshot.wordLength);
    showToast(response.message ?? "Word not in list", "error", 2500);
    return;
  }

  const rowIndex = localBoardState.activeRowIndex;
  localBoardState.rows[rowIndex] = response.evaluatedCells.map((cell) => ({ ...cell }));
  response.evaluatedCells.forEach((cell) => updateKeyboardStatus(cell.letter, cell.status));
  localBoardState.currentGuess = "";

  if (response.solved) {
    localBoardState.solved = true;
    renderLobby(response.snapshot);
    showToast("You solved it first!", "info", 2600);
    return;
  }

  if (localBoardState.activeRowIndex >= response.snapshot.maxRows - 1) {
    localBoardState.exhausted = true;
    renderLobby(response.snapshot);
    showToast("No more guesses this round.", "error", 2800);
    return;
  }

  localBoardState.activeRowIndex += 1;
  renderLobby(response.snapshot);
}

function startPolling(roomId: string) {
  stopPolling();
  pollTimer = window.setInterval(async () => {
    if (!currentRoomId || currentRoomId !== roomId) {
      return;
    }
    try {
      const snapshot = await fetchRoom(roomId);
      renderLobby(snapshot);
    } catch (error) {
      stopPolling();
      const message = error instanceof Error ? error.message : "Unable to refresh versus room";
      if (message.includes("(404)")) {
        clearMembership(roomId);
        window.history.replaceState({}, "", window.location.pathname);
        renderLanding();
        showToast("That versus room is gone. Create or join another one.", "error", 4000);
        return;
      }
      showToast("Polling stopped. Refresh when you’re ready.", "error", 3500);
    }
  }, 1000);
}

function stopPolling() {
  if (pollTimer != null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
}

async function bootstrap() {
  const roomId = getRoomIdFromUrl();
  if (!roomId) {
    renderLanding();
    return;
  }

  try {
    const snapshot = await fetchRoom(roomId);
    const membership = getMembership(roomId);
    if (membership && snapshot.players.some((player) => player.playerId === membership)) {
      renderLobby(snapshot);
      startPolling(roomId);
      return;
    }

    renderLanding(roomId, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load versus room";
    if (message.includes("(404)")) {
      renderLanding(roomId, true);
      showToast("That versus room does not exist. Create a new one instead.", "error", 4000);
      return;
    }
    renderLanding(roomId, true);
    showToast(message, "error", 4000);
  }
}

void bootstrap();
