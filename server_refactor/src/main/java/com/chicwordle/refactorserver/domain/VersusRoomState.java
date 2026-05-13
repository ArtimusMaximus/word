package com.chicwordle.refactorserver.domain;

import java.util.List;

public class VersusRoomState {
    private final String roomId;
    private final int wordLength;
    private final int maxRows;
    private final int maxPlayers;
    private final int roundNumber;
    private final int countdownSeconds;
    private final long countdownStartedAtEpochMillis;
    private final String solutionWord;
    private final String status;
    private final List<VersusPlayerState> players;
    private final String winnerPlayerId;

    public VersusRoomState(
        String roomId,
        int wordLength,
        int maxRows,
        int maxPlayers,
        int roundNumber,
        int countdownSeconds,
        long countdownStartedAtEpochMillis,
        String solutionWord,
        String status,
        List<VersusPlayerState> players,
        String winnerPlayerId
    ) {
        this.roomId = roomId;
        this.wordLength = wordLength;
        this.maxRows = maxRows;
        this.maxPlayers = maxPlayers;
        this.roundNumber = roundNumber;
        this.countdownSeconds = countdownSeconds;
        this.countdownStartedAtEpochMillis = countdownStartedAtEpochMillis;
        this.solutionWord = solutionWord;
        this.status = status;
        this.players = players;
        this.winnerPlayerId = winnerPlayerId;
    }

    public String getRoomId() {
        return roomId;
    }

    public int getWordLength() {
        return wordLength;
    }

    public int getMaxRows() {
        return maxRows;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public int getRoundNumber() {
        return roundNumber;
    }

    public int getCountdownSeconds() {
        return countdownSeconds;
    }

    public long getCountdownStartedAtEpochMillis() {
        return countdownStartedAtEpochMillis;
    }

    public String getSolutionWord() {
        return solutionWord;
    }

    public String getStatus() {
        return status;
    }

    public List<VersusPlayerState> getPlayers() {
        return players;
    }

    public String getWinnerPlayerId() {
        return winnerPlayerId;
    }
}
