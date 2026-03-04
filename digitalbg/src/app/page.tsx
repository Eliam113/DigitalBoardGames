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
      <main className="flex w-full max-w-md flex-col rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800">Welcome</h1>
        <label className="mt-6 flex flex-col items-center">
           <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="h-10 w-full max-w-[400px] rounded border px-4 text-center text-xl font-bold text-gray-800 placeholder:text-gray-400"
          />
        </label>
        <div className="mt-8 flex flex-col items-center gap-5">
          <button
            onClick={goCreate}
            className="h-10 w-full max-w-[400px] rounded border-none bg-red-600 px-6 text-xl font-bold text-white hover:bg-red-700"
          >
            Create Lobby
          </button>
          <button
            onClick={goJoin}
            className="h-10 w-full max-w-[400px] rounded border-none bg-red-600 px-6 text-xl font-bold text-white hover:bg-red-700"
          >
            Join Lobby
          </button>
        </div>
      </main>
    </div>
  );
}
