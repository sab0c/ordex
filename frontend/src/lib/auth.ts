export const ACCESS_TOKEN_KEY = "ordex-access-token";
const AUTH_EVENT_NAME = "ordex-auth-change";
const ACCESS_TOKEN_COOKIE_NAME = "ordex-access-token";
const THIRTY_DAYS_IN_SECONDS = 60 * 60 * 24 * 30;

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

  const localStorageToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);

  if (localStorageToken) {
    return localStorageToken;
  }

  const cookieToken = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ACCESS_TOKEN_COOKIE_NAME}=`))
    ?.split("=")[1];

  return cookieToken ? decodeURIComponent(cookieToken) : null;
}

export function setStoredAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${THIRTY_DAYS_IN_SECONDS}; SameSite=Lax`;
  notifyAuthChange();
}

export function clearStoredAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
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
