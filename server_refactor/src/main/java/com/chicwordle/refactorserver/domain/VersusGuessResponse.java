package com.chicwordle.refactorserver.domain;

import java.util.List;

public record VersusGuessResponse(
    boolean validGuess,
    boolean solved,
    String message,
    List<BoardCell> evaluatedCells,
    VersusRoomSnapshot snapshot
) {
}
