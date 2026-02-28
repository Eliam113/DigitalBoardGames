// simple in-browser lobby management using localStorage
// this is just a placeholder until the server/websocket logic is implemented

export function createLobby(pin: string, username: string) {
  const key = `lobby_${pin}`;
  const members = [username];
  localStorage.setItem(key, JSON.stringify(members));
  localStorage.setItem(`host_${pin}`, username);
}

export function joinLobby(pin: string, username: string) {
  const key = `lobby_${pin}`;
  const raw = localStorage.getItem(key);
  let members: string[] = [];
  if (raw) {
    try {
      members = JSON.parse(raw);
    } catch (e) {
      members = [];
    }
  }
  if (!members.includes(username)) {
    members.push(username);
    localStorage.setItem(key, JSON.stringify(members));
  }
}

export function getLobbyMembers(pin: string): string[] {
  const raw = localStorage.getItem(`lobby_${pin}`);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getHost(pin: string): string | null {
  return localStorage.getItem(`host_${pin}`);
}

export function isHost(pin: string, username: string): boolean {
  const host = getHost(pin);
  return host === username;
}
