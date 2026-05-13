package com.chicwordle.refactorserver.domain;

public record VersusCreateRoomRequest(
    String roomId,
    String hostUsername
) {
}
