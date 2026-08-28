package com.chicwordle.refactorserver.domain;

public record CreateRoomRequest(
    String roomName,
    String hostUsername
) {
}
