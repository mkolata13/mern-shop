import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string;
}

export const getRoleFromJwt = (): string | null => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  try {
    const decoded: JwtPayload = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
