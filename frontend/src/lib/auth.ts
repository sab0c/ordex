export const ACCESS_TOKEN_KEY = "ordex-access-token";
const AUTH_EVENT_NAME = "ordex-auth-change";

function notifyAuthChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthChange();
}

export function clearStoredAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthChange();
}

export function subscribeToAuthChange(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener("storage", handleChange);
  window.addEventListener(AUTH_EVENT_NAME, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(AUTH_EVENT_NAME, handleChange);
  };
}
