"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function JoinPage() {
  const [pin, setPin] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get("username") || "";

  // if somebody navigates here without a username, send them back
  useEffect(() => {
    if (!username) {
      router.replace("/");
    }
  }, [username, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      alert("Please enter a lobby pin.");
      return;
    }
    router.push(
      `/lobby?username=${encodeURIComponent(username)}&pin=${encodeURIComponent(
        pin
      )}&host=false`
    );
  };

  return (
    <div className="flex h-screen items-center justify-center bg-blue-50">
      <div className="w-full max-w-md mx-auto p-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-col gap-4 rounded-md bg-white p-6 shadow-md"
        >
          <h1 className="text-2xl font-semibold text-center">Join Lobby</h1>
          <p className="text-sm text-gray-600 text-center">Username: {username}</p>
          <label className="w-full">
            <span className="block text-sm font-medium">Lobby Pin</span>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
