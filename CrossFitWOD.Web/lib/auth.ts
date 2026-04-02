import Cookies from "js-cookie";

const TOKEN_KEY   = "wod_token";
const PROFILE_KEY = "wod_has_profile";
const ROLE_KEY    = "wod_role";

const COOKIE_OPTS = { expires: 1, sameSite: "strict" } as const;

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, COOKIE_OPTS);
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(PROFILE_KEY);
  Cookies.remove(ROLE_KEY);
}

export function setHasProfile(): void {
  Cookies.set(PROFILE_KEY, "1", COOKIE_OPTS);
}

export function setRole(role: string): void {
  Cookies.set(ROLE_KEY, role, COOKIE_OPTS);
}

export function getRole(): string | undefined {
  return Cookies.get(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
