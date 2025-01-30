import apiClient from "../api/axiosClient";

export const login = async (username: string, password: string) => {
  const response = await apiClient.post("/auth/login", { username, password });
  return response.data;
};

export const register = async (username: string, password: string) => {
  const response = await apiClient.post("/auth/register", { username, password });
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const refreshAccessToken = async () => {
  try {
    const response = await apiClient.post("/auth/refresh-token");
    const { accessToken } = response.data;

    localStorage.setItem("access_token", accessToken);

    return accessToken;
  } catch (error) {
    console.error("Error refreshing access token", error);
    throw error;
  }
};
