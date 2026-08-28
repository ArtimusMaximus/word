package com.chicwordle.refactorserver.store;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.chicwordle.refactorserver.domain.RoomState;

@Component
public class RoomStore {
    private final Map<String, RoomState> rooms = new ConcurrentHashMap<>();
    private final Map<String, String> roomIdsByName = new ConcurrentHashMap<>();
    private final Map<String, String> roomNamesById = new ConcurrentHashMap<>();

    public RoomState find(String roomId) {
        return rooms.get(roomId);
    }

    public RoomState save(RoomState roomState) {
        rooms.put(roomState.getRoomId(), roomState);
        return roomState;
    }

    public synchronized boolean registerName(String roomId, String roomName, String normalizedRoomName) {
        if (roomIdsByName.containsKey(normalizedRoomName)) {
            return false;
        }
        roomIdsByName.put(normalizedRoomName, roomId);
        roomNamesById.put(roomId, roomName);
        return true;
    }

    public RoomState findByNormalizedName(String normalizedRoomName) {
        String roomId = roomIdsByName.get(normalizedRoomName);
        return roomId == null ? null : rooms.get(roomId);
    }

    public String findName(String roomId) {
        return roomNamesById.get(roomId);
    }

    public void delete(String roomId) {
        rooms.remove(roomId);
        String roomName = roomNamesById.remove(roomId);
        if (roomName != null) {
            roomIdsByName.remove(normalizeRoomName(roomName), roomId);
        }
    }

    private String normalizeRoomName(String roomName) {
        return roomName.trim().replaceAll("\\s+", " ").toLowerCase(java.util.Locale.ROOT);
    }
}
