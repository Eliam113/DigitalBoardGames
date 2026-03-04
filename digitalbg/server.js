import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors({ origin: true, credentials: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

const lobbies = new Map(); // pin -> { hostName: string, members: Set<{id,name}> }

function makePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function lobbyPayload(lobby) {
  return {
    hostName: lobby.hostName,
    members: [...lobby.members].map((m) => ({ name: m.name })),
  };
}

io.on("connection", (socket) => {
  socket.on("createLobby", ({ username }) => {
    if (!username) return socket.emit("error", "Username is required.");

    let pin = makePin();
    while (lobbies.has(pin)) pin = makePin();

    const lobby = {
      hostName: username,
      members: new Set([{ id: socket.id, name: username }]),
    };

    lobbies.set(pin, lobby);
    socket.join(pin);
    socket.data.pin = pin;
    socket.data.username = username;

    socket.emit("lobbyCreated", { pin, ...lobbyPayload(lobby) });
  });

  socket.on("joinLobby", ({ pin, username }) => {
    const lobby = lobbies.get(pin);
    if (!lobby) return socket.emit("error", "Lobby not found.");
    if (!username) return socket.emit("error", "Username is required.");

    lobby.members.add({ id: socket.id, name: username });
    socket.join(pin);
    socket.data.pin = pin;
    socket.data.username = username;

    socket.emit("lobbyJoined", lobbyPayload(lobby));
    io.to(pin).emit("lobbyUpdated", lobbyPayload(lobby));
  });

  socket.on("getLobbyState", ({ pin }) => {
    const lobby = lobbies.get(pin);
    if (!lobby) {
      socket.emit("error", "Lobby not found.");
      return;
    }
    socket.emit("lobbyState", lobbyPayload(lobby));
  });

  socket.on("subscribeLobby", ({ pin, username }) => {
    const lobby = lobbies.get(pin);
    if (!lobby) return socket.emit("error", "Lobby not found.");

    socket.join(pin);
    socket.data.pin = pin;
    socket.data.username = username;

    // upsert member by username (important after refresh/reconnect)
    const members = [...lobby.members].filter((m) => m.name !== username);
    members.push({ id: socket.id, name: username });
    lobby.members = new Set(members);

    io.to(pin).emit("lobbyUpdated", lobbyPayload(lobby));
  });

  socket.on("startGame", ({ pin }) => {
    const lobby = lobbies.get(pin);
    if (!lobby) return socket.emit("error", "Lobby not found.");

    const caller = [...lobby.members].find((m) => m.id === socket.id);
    if (!caller || caller.name !== lobby.hostName) {
      return socket.emit("error", "Only host can start the game.");
    }

    io.to(pin).emit("gameStarted");
  });

  socket.on("disconnect", () => {
    const pin = socket.data.pin;
    if (!pin) return;
    const lobby = lobbies.get(pin);
    if (!lobby) return;

    lobby.members = new Set([...lobby.members].filter((m) => m.id !== socket.id));

    if (lobby.members.size === 0) {
      lobbies.delete(pin);
      return;
    }

    if (![...lobby.members].some((m) => m.name === lobby.hostName)) {
      lobby.hostName = [...lobby.members][0].name;
    }

    io.to(pin).emit("lobbyUpdated", lobbyPayload(lobby));
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});