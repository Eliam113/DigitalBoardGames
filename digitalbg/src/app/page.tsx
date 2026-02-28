"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const goCreate = () => {
    if (!username) {
      alert("Please enter a username.");
      return;
    }
    router.push(`/create?username=${encodeURIComponent(username)}`);
  };

  const goJoin = () => {
    if (!username) {
      alert("Please enter a username.");
      return;
    }
    router.push(`/join?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Welcome</h1>
        <label className="flex flex-col">
          <span className="mb-1 font-medium text-gray-700">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border px-3 py-2 border-red-300 text-gray-800"
          />
        </label>
        <div className="flex gap-4">
          <button
            onClick={goCreate}
            className="flex-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 w-xl"
          >
            Create Lobby
          </button>
          <button
            onClick={goJoin}
            className="flex-1 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Join Lobby
          </button>
        </div>
      </main>
    </div>
  );
}
