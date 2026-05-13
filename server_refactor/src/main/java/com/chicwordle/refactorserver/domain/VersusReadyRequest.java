package com.chicwordle.refactorserver.domain;

public record VersusReadyRequest(
    String playerId,
    boolean ready
) {
}
