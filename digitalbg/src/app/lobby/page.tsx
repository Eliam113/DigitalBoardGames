"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getLobbyMembers,
  joinLobby,
  isHost as checkHost,
  getHost,
} from "../../lib/lobby";

export default function LobbyPage() {
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";
  const pin = searchParams.get("pin") || "";
  const hostParam = searchParams.get("host") === "true";
  const [members, setMembers] = useState<string[]>([]);
  const [host, setHost] = useState<string | null>(null);

  useEffect(() => {
    if (!pin || !username) {
      // navigate back if data missing
      window.location.href = "/";
      return;
    }

    if (hostParam) {
      // since the query param told us we are the host, ensure lobby exists
      joinLobby(pin, username);
      setHost(username);
    } else {
      // joining an existing lobby
      joinLobby(pin, username);
    }

    const storedMembers = getLobbyMembers(pin);
    setMembers(storedMembers);
    setHost(getHost(pin));

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `lobby_${pin}`) {
        setMembers(getLobbyMembers(pin));
      }
      if (e.key === `host_${pin}`) {
        setHost(getHost(pin));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pin, username, hostParam]);

  const startGame = () => {
    alert("Starting game (placeholder)");
  };

  if (!pin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Invalid lobby. Go back to the <a href="/">home page</a>.</p>
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
