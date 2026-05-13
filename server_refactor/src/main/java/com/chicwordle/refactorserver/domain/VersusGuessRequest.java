package com.chicwordle.refactorserver.domain;

public record VersusGuessRequest(
    String playerId,
    String guess
) {
}
