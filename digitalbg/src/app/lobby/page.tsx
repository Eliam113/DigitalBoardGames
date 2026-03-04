"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;
function getSocket(): ReturnType<typeof io> {
  if (!socket) {
    socket = io("http://localhost:3001");
  }
  return socket;
}

interface Lobby {
  members: { name: string }[];
  hostName: string;
}

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const pin = searchParams.get("pin") || "";
  const router = useRouter();

  const [members, setMembers] = useState<string[]>([]);
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    if (!pin || !username) {
      router.replace("/");
      return;
    }

    const socket = getSocket();

    const applyLobby = (lobby: Lobby) => {
      setMembers(lobby.members.map((m) => m.name));
      setHost(lobby.hostName);
    };

    const subscribe = () => {
    socket.emit("subscribeLobby", { pin, username });
  };

    socket.on("connect", subscribe);
    socket.on("lobbyJoined", applyLobby);
    socket.on("lobbyUpdated", applyLobby);
    socket.on("lobbyState", applyLobby);

    socket.on("gameStarted", () => {
      router.replace("/werewolf?pin=" + encodeURIComponent(pin));
    });

    socket.on("error", (msg: string) => {
      alert(msg);
      router.replace("/join?username=" + encodeURIComponent(username));
    });

    subscribe();
    // request current lobby snapshot so UI is never empty on first load
    socket.emit("getLobbyState", { pin });

    return () => {
      socket.off("connect", subscribe);
      socket.off("lobbyJoined", applyLobby);
      socket.off("lobbyUpdated", applyLobby);
      socket.off("lobbyState", applyLobby);
      socket.off("gameStarted");
      socket.off("error");
    };
  }, [pin, username, router]);

  const startGame = () => {
    const socket = getSocket();
    socket.emit("startGame", { pin });
  };

  if (!pin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Invalid lobby. Go back to the <Link href="/">home page</Link>.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-yellow-50 p-6">
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold">Lobby</h1>
        <p className="mb-2">
          Pin:&nbsp;<span className="font-mono">{pin}</span>
        </p>
        <ul className="mb-4 mx-auto list-disc pl-5 text-center">
          {members.map((m) => (
            <li key={m} className={m === username ? "font-semibold" : ""}>
              {m} {m === username ? "(you)" : ""}
            </li>
          ))}
        </ul>
        {host === username && (
          <button
            onClick={startGame}
            className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
