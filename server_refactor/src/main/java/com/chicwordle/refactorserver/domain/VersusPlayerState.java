package com.chicwordle.refactorserver.domain;

public record VersusPlayerState(
    String playerId,
    String username,
    boolean connected,
    boolean ready,
    int roundWins,
    int totalWins,
    String status
) {
}
