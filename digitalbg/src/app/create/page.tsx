"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;
function getSocket(): ReturnType<typeof io> {
  if (!socket) {
    socket = io("http://localhost:3001");
  }
  return socket;
}

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  useEffect(() => {
    if (!username) {
      router.replace("/");
      return;
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const socket = getSocket();

    socket.emit("createLobby", { pin, username });

    // create flow should listen for lobbyCreated (not lobbyJoined)
    socket.once("lobbyCreated", (payload?: { pin?: string }) => {
      const finalPin = payload?.pin ?? pin;
      router.replace(
        `/lobby?username=${encodeURIComponent(username)}&pin=${encodeURIComponent(finalPin)}&host=true`
      );
    });

    socket.once("error", (msg: string) => {
      alert(msg);
      router.replace("/");
    });

    return () => {
      socket.off("lobbyCreated");
      socket.off("error");
    };
  }, [username, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-green-50">
      <p className="text-lg font-medium">Creating lobby...</p>
    </div>
  );
}