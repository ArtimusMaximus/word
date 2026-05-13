package com.chicwordle.refactorserver.domain;

import java.util.List;

public record VersusRoomSnapshot(
    String roomId,
    int wordLength,
    int maxRows,
    String status,
    int maxPlayers,
    int roundNumber,
    int countdownSeconds,
    long countdownStartedAtEpochMillis,
    int readyPlayerCount,
    List<VersusPlayerState> players,
    String winnerPlayerId,
    String debugWord
) {
}
