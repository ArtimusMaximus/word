package com.chicwordle.refactorserver.domain;

public record VersusRenameRequest(
    String playerId,
    String username
) {
}
