package com.chicwordle.refactorserver.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chicwordle.refactorserver.domain.VersusCreateRoomRequest;
import com.chicwordle.refactorserver.domain.VersusFinishRequest;
import com.chicwordle.refactorserver.domain.VersusGuessRequest;
import com.chicwordle.refactorserver.domain.VersusGuessResponse;
import com.chicwordle.refactorserver.domain.VersusJoinRoomRequest;
import com.chicwordle.refactorserver.domain.VersusLeaveRoomRequest;
import com.chicwordle.refactorserver.domain.VersusReadyRequest;
import com.chicwordle.refactorserver.domain.VersusRenameRequest;
import com.chicwordle.refactorserver.domain.VersusRoomSnapshot;
import com.chicwordle.refactorserver.service.VersusRoomService;

@RestController
@RequestMapping("/api/versus/rooms")
public class VersusRoomController {
    private final VersusRoomService versusRoomService;

    public VersusRoomController(VersusRoomService versusRoomService) {
        this.versusRoomService = versusRoomService;
    }

    @GetMapping("/{roomId}")
    public VersusRoomSnapshot getRoom(@PathVariable String roomId) {
        return versusRoomService.getRoomSnapshot(roomId);
    }

    @PostMapping
    public VersusRoomSnapshot createRoom(@RequestBody VersusCreateRoomRequest request) {
        return versusRoomService.createRoom(request);
    }

    @PostMapping("/{roomId}/join")
    public VersusRoomSnapshot joinRoom(@PathVariable String roomId, @RequestBody VersusJoinRoomRequest request) {
        return versusRoomService.joinRoom(roomId, request);
    }

    @PostMapping("/{roomId}/ready")
    public VersusRoomSnapshot updateReadyState(@PathVariable String roomId, @RequestBody VersusReadyRequest request) {
        return versusRoomService.updateReadyState(roomId, request);
    }

    @PostMapping("/{roomId}/rename")
    public VersusRoomSnapshot renamePlayer(@PathVariable String roomId, @RequestBody VersusRenameRequest request) {
        return versusRoomService.renamePlayer(roomId, request);
    }

    @PostMapping("/{roomId}/leave")
    public void leaveRoom(@PathVariable String roomId, @RequestBody VersusLeaveRoomRequest request) {
        versusRoomService.leaveRoom(roomId, request);
    }

    @PostMapping("/{roomId}/finish")
    public VersusRoomSnapshot finishRound(@PathVariable String roomId, @RequestBody VersusFinishRequest request) {
        return versusRoomService.finishRound(roomId, request);
    }

    @PostMapping("/{roomId}/guess")
    public VersusGuessResponse submitGuess(@PathVariable String roomId, @RequestBody VersusGuessRequest request) {
        return versusRoomService.submitGuess(roomId, request);
    }

    @PostMapping("/{roomId}/next-round")
    public VersusRoomSnapshot nextRound(@PathVariable String roomId) {
        return versusRoomService.resetReadyForNextRound(roomId);
    }
}
