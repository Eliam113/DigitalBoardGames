// basic express + websocket stub for lobby management
// this is placeholder logic; more detailed game code will be added later

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// simple in-memory lobby map: pin -> { host, members: Set(ws) }
const lobbies = new Map();

wss.on("connection", function connection(ws) {
  ws.on("message", function message(raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      console.warn("received non-json message", raw);
      return;
    }

    switch (msg.type) {
      case "create": {
        const { pin, username } = msg;
        lobbies.set(pin, { host: username, members: new Set([ws]) });
        ws.send(JSON.stringify({ type: "created", pin }));
        break;
      }
      case "join": {
        const { pin, username } = msg;
        const lobby = lobbies.get(pin);
        if (lobby) {
          lobby.members.add(ws);
          // broadcast new member to others
          lobby.members.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({ type: "member-joined", username })
              );
            }
          });
          ws.send(JSON.stringify({ type: "joined", pin }));
        } else {
          ws.send(JSON.stringify({ type: "error", message: "Lobby not found" }));
        }
        break;
      }
      case "start": {
        const { pin } = msg;
        const lobby = lobbies.get(pin);
        if (lobby) {
          // notify everyone lobby starting
          lobby.members.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "start" }));
            }
          });
        }
        break;
      }
      default:
        console.warn("unknown message type", msg.type);
    }
  });

  ws.on("close", () => {
    // cleanup: remove from any lobby
    for (const [pin, lobby] of lobbies.entries()) {
      if (lobby.members.has(ws)) {
        lobby.members.delete(ws);
        // if host left, choose another or delete lobby
        if (lobby.members.size === 0) {
          lobbies.delete(pin);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
