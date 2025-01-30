import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  username?: string;
  role?: string;
  exp?: number;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const getUsernameFromJwt = (): string | null => {
  const token = localStorage.getItem("access_token");
  if (token) {
    const decoded = decodeJwt(token);
    return decoded?.username ?? null;
  }
  return null;
};
