import { API_URL } from "./api.config";
import apiClient from "./axiosClient";

export const initProducts = async (file: File | null, isJSON: boolean) => {
  if (!file) {
    throw new Error("No file provided");
  }

  let headers: Record<string, string> = {};
  let data: any;

  if (isJSON) {
    headers["Content-Type"] = "application/json";
    const jsonData = await file.text();
    data = JSON.parse(jsonData);
    if (!Array.isArray(data)) {
      throw new Error("Invalid JSON format: Expected an array of products");
    }
  } else {
    headers["Content-Type"] = "multipart/form-data";
    const formData = new FormData();
    formData.append("file", file);
    data = formData;
  }

  const response = await apiClient.post(`${API_URL}/init`, data, { headers });
  return response.data;
};
