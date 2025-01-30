import { API_URL } from "../api/api.config";
import apiClient from "./axiosClient";

export const getCategories = async () => {
    const response = await apiClient.get(`${API_URL}/categories`);
    return response.data;
};
