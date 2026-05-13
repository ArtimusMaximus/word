package com.chicwordle.refactorserver.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.chicwordle.refactorserver.domain.BoardCell;
import com.chicwordle.refactorserver.domain.VersusCreateRoomRequest;
import com.chicwordle.refactorserver.domain.VersusFinishRequest;
import com.chicwordle.refactorserver.domain.VersusGuessRequest;
import com.chicwordle.refactorserver.domain.VersusGuessResponse;
import com.chicwordle.refactorserver.domain.VersusJoinRoomRequest;
import com.chicwordle.refactorserver.domain.VersusLeaveRoomRequest;
import com.chicwordle.refactorserver.domain.VersusPlayerState;
import com.chicwordle.refactorserver.domain.VersusReadyRequest;
import com.chicwordle.refactorserver.domain.VersusRenameRequest;
import com.chicwordle.refactorserver.domain.VersusRoomSnapshot;
import com.chicwordle.refactorserver.domain.VersusRoomState;
import com.chicwordle.refactorserver.store.VersusRoomStore;

@Service
public class VersusRoomService {
    private static final int WORD_LENGTH = 5;
    private static final int MAX_ROWS = 6;
    private static final int MAX_PLAYERS_PER_ROOM = 50;
    private static final int DEFAULT_COUNTDOWN_SECONDS = 5;

    private final VersusRoomStore versusRoomStore;
    private final WordService wordService;

    public VersusRoomService(VersusRoomStore versusRoomStore, WordService wordService) {
        this.versusRoomStore = versusRoomStore;
        this.wordService = wordService;
    }

    public VersusRoomSnapshot getRoomSnapshot(String roomId) {
        return toSnapshot(normalizeRoom(requireRoom(roomId)));
    }

    public VersusRoomSnapshot createRoom(VersusCreateRoomRequest request) {
        String roomId = sanitizeRoomId(request.roomId());
        String hostUsername = sanitizeUsername(request.hostUsername());

        if (versusRoomStore.find(roomId) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Versus room already exists");
        }

        List<VersusPlayerState> players = List.of(
            new VersusPlayerState(newPlayerId(), hostUsername, true, false, 0, 0, "WAITING")
        );

        VersusRoomState room = new VersusRoomState(
            roomId,
            WORD_LENGTH,
            MAX_ROWS,
            MAX_PLAYERS_PER_ROOM,
            1,
            DEFAULT_COUNTDOWN_SECONDS,
            0,
            wordService.getRandomRoomWord().toUpperCase(),
            "WAITING_FOR_PLAYERS",
            players,
            null
        );

        versusRoomStore.save(room);
        return toSnapshot(room);
    }

    public VersusRoomSnapshot joinRoom(String roomId, VersusJoinRoomRequest request) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));
        String username = sanitizeUsername(request.username());

        boolean duplicateUsername = room.getPlayers()
            .stream()
            .anyMatch(player -> player.username().equalsIgnoreCase(username));
        if (duplicateUsername) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists in versus room");
        }
        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Versus room is full");
        }

        List<VersusPlayerState> updatedPlayers = new ArrayList<>(room.getPlayers());
        updatedPlayers.add(new VersusPlayerState(newPlayerId(), username, true, false, 0, 0, "WAITING"));

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            room.getCountdownSeconds(),
            room.getCountdownStartedAtEpochMillis(),
            room.getSolutionWord(),
            updatedPlayers.size() > 1 ? "LOBBY_OPEN" : room.getStatus(),
            List.copyOf(updatedPlayers),
            room.getWinnerPlayerId()
        );

        versusRoomStore.save(updatedRoom);
        return toSnapshot(updatedRoom);
    }

    public VersusRoomSnapshot updateReadyState(String roomId, VersusReadyRequest request) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));
        String playerId = sanitizePlayerId(request.playerId());

        boolean playerExists = room.getPlayers()
            .stream()
            .anyMatch(player -> player.playerId().equals(playerId));
        if (!playerExists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found in versus room");
        }

        List<VersusPlayerState> updatedPlayers = room.getPlayers()
            .stream()
            .map(player -> player.playerId().equals(playerId)
                ? new VersusPlayerState(
                    player.playerId(),
                    player.username(),
                    player.connected(),
                    request.ready(),
                    player.roundWins(),
                    player.totalWins(),
                    request.ready() ? "READY" : "WAITING"
                )
                : player)
            .toList();

        boolean everyoneReady = !updatedPlayers.isEmpty() && updatedPlayers.stream().allMatch(VersusPlayerState::ready);
        String nextStatus = everyoneReady ? "COUNTDOWN" : updatedPlayers.size() > 1 ? "LOBBY_OPEN" : "WAITING_FOR_PLAYERS";
        long countdownStartedAt = everyoneReady ? System.currentTimeMillis() : 0;

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            room.getCountdownSeconds(),
            countdownStartedAt,
            room.getSolutionWord(),
            nextStatus,
            List.copyOf(updatedPlayers),
            null
        );

        versusRoomStore.save(updatedRoom);
        return toSnapshot(normalizeRoom(updatedRoom));
    }

    public VersusRoomSnapshot renamePlayer(String roomId, VersusRenameRequest request) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));
        String playerId = sanitizePlayerId(request.playerId());
        String username = sanitizeUsername(request.username());

        boolean duplicateUsername = room.getPlayers()
            .stream()
            .anyMatch(player -> !player.playerId().equals(playerId) && player.username().equalsIgnoreCase(username));
        if (duplicateUsername) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists in versus room");
        }

        boolean playerExists = room.getPlayers()
            .stream()
            .anyMatch(player -> player.playerId().equals(playerId));
        if (!playerExists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found in versus room");
        }

        List<VersusPlayerState> updatedPlayers = room.getPlayers()
            .stream()
            .map(player -> player.playerId().equals(playerId)
                ? new VersusPlayerState(
                    player.playerId(),
                    username,
                    player.connected(),
                    player.ready(),
                    player.roundWins(),
                    player.totalWins(),
                    player.status()
                )
                : player)
            .toList();

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            room.getCountdownSeconds(),
            room.getCountdownStartedAtEpochMillis(),
            room.getSolutionWord(),
            room.getStatus(),
            List.copyOf(updatedPlayers),
            room.getWinnerPlayerId()
        );

        versusRoomStore.save(updatedRoom);
        return toSnapshot(updatedRoom);
    }

    public void leaveRoom(String roomId, VersusLeaveRoomRequest request) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));
        String playerId = sanitizePlayerId(request.playerId());

        List<VersusPlayerState> remainingPlayers = room.getPlayers()
            .stream()
            .filter(player -> !player.playerId().equals(playerId))
            .toList();

        if (remainingPlayers.size() == room.getPlayers().size()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found in versus room");
        }

        if (remainingPlayers.isEmpty()) {
            versusRoomStore.delete(roomId);
            return;
        }

        boolean everyoneReady = remainingPlayers.stream().allMatch(VersusPlayerState::ready);
        String nextStatus = remainingPlayers.size() == 1
            ? "WAITING_FOR_PLAYERS"
            : everyoneReady ? "COUNTDOWN" : "LOBBY_OPEN";

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            room.getCountdownSeconds(),
            0,
            room.getSolutionWord(),
            nextStatus,
            List.copyOf(remainingPlayers),
            remainingPlayers.stream().anyMatch(player -> player.playerId().equals(room.getWinnerPlayerId())) ? room.getWinnerPlayerId() : null
        );

        versusRoomStore.save(updatedRoom);
    }

    public VersusRoomSnapshot finishRound(String roomId, VersusFinishRequest request) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));
        String playerId = sanitizePlayerId(request.playerId());

        if (!"ROUND_ACTIVE".equals(room.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Round is not active");
        }

        boolean playerExists = room.getPlayers().stream().anyMatch(player -> player.playerId().equals(playerId));
        if (!playerExists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found in versus room");
        }

        List<VersusPlayerState> updatedPlayers = room.getPlayers()
            .stream()
            .map(player -> {
                boolean isWinner = player.playerId().equals(playerId);
                return new VersusPlayerState(
                    player.playerId(),
                    player.username(),
                    player.connected(),
                    false,
                    isWinner ? player.roundWins() + 1 : player.roundWins(),
                    isWinner ? player.totalWins() + 1 : player.totalWins(),
                    isWinner ? "WINNER" : "FINISHED"
                );
            })
            .toList();

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            room.getCountdownSeconds(),
            0,
            room.getSolutionWord(),
            "ROUND_COMPLETE",
            List.copyOf(updatedPlayers),
            playerId
        );

        versusRoomStore.save(updatedRoom);
        return toSnapshot(updatedRoom);
    }

    public VersusRoomSnapshot resetReadyForNextRound(String roomId) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));

        List<VersusPlayerState> resetPlayers = room.getPlayers()
            .stream()
            .map(player -> new VersusPlayerState(
                player.playerId(),
                player.username(),
                player.connected(),
                false,
                0,
                player.totalWins(),
                "WAITING"
            ))
            .toList();

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber() + 1,
            room.getCountdownSeconds(),
            0,
            wordService.getRandomRoomWord().toUpperCase(),
            resetPlayers.size() > 1 ? "LOBBY_OPEN" : "WAITING_FOR_PLAYERS",
            List.copyOf(resetPlayers),
            null
        );

        versusRoomStore.save(updatedRoom);
        return toSnapshot(updatedRoom);
    }

    public VersusGuessResponse submitGuess(String roomId, VersusGuessRequest request) {
        VersusRoomState room = normalizeRoom(requireRoom(roomId));
        String playerId = sanitizePlayerId(request.playerId());
        String guess = sanitizeGuess(request.guess(), room.getWordLength());

        boolean playerExists = room.getPlayers().stream().anyMatch(player -> player.playerId().equals(playerId));
        if (!playerExists) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Player not found in versus room");
        }
        if (!"ROUND_ACTIVE".equals(room.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Round is not active");
        }
        if (!wordService.isValidGuess(guess)) {
            return new VersusGuessResponse(false, false, "Word not in list", List.of(), toSnapshot(room));
        }

        List<BoardCell> evaluatedCells = evaluateGuess(guess, room.getSolutionWord());
        boolean solved = evaluatedCells.stream().allMatch(cell -> "correct".equals(cell.status()));
        if (!solved) {
            return new VersusGuessResponse(true, false, null, evaluatedCells, toSnapshot(room));
        }

        VersusRoomSnapshot completedSnapshot = finishRound(roomId, new VersusFinishRequest(playerId));
        return new VersusGuessResponse(true, true, null, evaluatedCells, completedSnapshot);
    }

    private VersusRoomState requireRoom(String roomId) {
        VersusRoomState room = versusRoomStore.find(roomId);
        if (room == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Versus room not found");
        }
        return room;
    }

    private VersusRoomSnapshot toSnapshot(VersusRoomState room) {
        int readyCount = (int) room.getPlayers().stream().filter(VersusPlayerState::ready).count();
        return new VersusRoomSnapshot(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getStatus(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            room.getCountdownSeconds(),
            room.getCountdownStartedAtEpochMillis(),
            readyCount,
            room.getPlayers(),
            room.getWinnerPlayerId(),
            room.getSolutionWord()
        );
    }

    private VersusRoomState normalizeRoom(VersusRoomState room) {
        if (!"COUNTDOWN".equals(room.getStatus())) {
            return room;
        }

        long countdownStartedAt = room.getCountdownStartedAtEpochMillis();
        if (countdownStartedAt <= 0) {
            return room;
        }

        long elapsedSeconds = Math.max(0, (System.currentTimeMillis() - countdownStartedAt) / 1000);
        int remaining = Math.max(0, DEFAULT_COUNTDOWN_SECONDS - (int) elapsedSeconds);

        if (remaining > 0) {
            if (remaining == room.getCountdownSeconds()) {
                return room;
            }
            VersusRoomState updatedRoom = new VersusRoomState(
                room.getRoomId(),
                room.getWordLength(),
                room.getMaxRows(),
                room.getMaxPlayers(),
                room.getRoundNumber(),
                remaining,
                countdownStartedAt,
                room.getSolutionWord(),
                "COUNTDOWN",
                room.getPlayers(),
                null
            );
            versusRoomStore.save(updatedRoom);
            return updatedRoom;
        }

        List<VersusPlayerState> racingPlayers = room.getPlayers()
            .stream()
            .map(player -> new VersusPlayerState(
                player.playerId(),
                player.username(),
                player.connected(),
                false,
                player.roundWins(),
                player.totalWins(),
                "RACING"
            ))
            .toList();

        VersusRoomState updatedRoom = new VersusRoomState(
            room.getRoomId(),
            room.getWordLength(),
            room.getMaxRows(),
            room.getMaxPlayers(),
            room.getRoundNumber(),
            0,
            0,
            room.getSolutionWord(),
            "ROUND_ACTIVE",
            List.copyOf(racingPlayers),
            null
        );

        versusRoomStore.save(updatedRoom);
        return updatedRoom;
    }

    private String sanitizeRoomId(String roomId) {
        String sanitized = roomId == null ? "" : roomId.trim();
        if (sanitized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room ID is required");
        }
        return sanitized;
    }

    private String sanitizeUsername(String username) {
        String sanitized = username == null ? "" : username.trim();
        if (sanitized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }
        return sanitized;
    }

    private String sanitizePlayerId(String playerId) {
        String sanitized = playerId == null ? "" : playerId.trim();
        if (sanitized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Player ID is required");
        }
        return sanitized;
    }

    private String sanitizeGuess(String guess, int wordLength) {
        String sanitized = guess == null ? "" : guess.trim().toUpperCase();
        if (sanitized.length() != wordLength) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Guess must be 5 letters");
        }
        return sanitized;
    }

    private List<BoardCell> evaluateGuess(String guess, String solutionWord) {
        List<BoardCell> evaluatedCells = new ArrayList<>();
        Map<Character, Integer> remainingLetters = new HashMap<>();
        char[] guessChars = guess.toCharArray();
        char[] solutionChars = solutionWord.toUpperCase().toCharArray();
        String[] statuses = new String[guessChars.length];

        for (int index = 0; index < solutionChars.length; index++) {
            if (guessChars[index] == solutionChars[index]) {
                statuses[index] = "correct";
            } else {
                remainingLetters.merge(solutionChars[index], 1, Integer::sum);
            }
        }

        for (int index = 0; index < guessChars.length; index++) {
            if (statuses[index] != null) {
                continue;
            }

            int remainingCount = remainingLetters.getOrDefault(guessChars[index], 0);
            if (remainingCount > 0) {
                statuses[index] = "present";
                remainingLetters.put(guessChars[index], remainingCount - 1);
            } else {
                statuses[index] = "miss";
            }
        }

        for (int index = 0; index < guessChars.length; index++) {
            evaluatedCells.add(new BoardCell(String.valueOf(guessChars[index]), statuses[index]));
        }

        return evaluatedCells;
    }

    private String newPlayerId() {
        return UUID.randomUUID().toString();
    }
}
