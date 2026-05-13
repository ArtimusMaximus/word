package com.chicwordle.refactorserver.store;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.chicwordle.refactorserver.domain.VersusRoomState;

@Component
public class VersusRoomStore {
    private final Map<String, VersusRoomState> rooms = new ConcurrentHashMap<>();

    public VersusRoomState find(String roomId) {
        return rooms.get(roomId);
    }

    public VersusRoomState save(VersusRoomState roomState) {
        rooms.put(roomState.getRoomId(), roomState);
        return roomState;
    }

    public void delete(String roomId) {
        rooms.remove(roomId);
    }
}
