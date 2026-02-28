"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createLobby } from "../../lib/lobby";

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  useEffect(() => {
    // If there is no username, send the user back to home
    if (!username) {
      router.replace("/");
      return;
    }

    // generate a 6-digit pin for the lobby
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    createLobby(pin, username);

    // redirect immediately to the lobby page as host
    router.replace(
      `/lobby?username=${encodeURIComponent(username)}&pin=${pin}&host=true`
    );
  }, [username, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-green-50">
      <p className="text-lg font-medium">Creating lobby...</p>
    </div>
  );
}
