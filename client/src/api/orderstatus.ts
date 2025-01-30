import { API_URL } from "./api.config";
import apiClient from "./axiosClient";

export const getStatuses = async () => {
    const response = await apiClient.get(`${API_URL}/status`);
    return response.data;
};
