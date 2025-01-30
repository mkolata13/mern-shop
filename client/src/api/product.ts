import { API_URL } from "./api.config";
import apiClient from "./axiosClient";

export const getProducts = async () => {
  const response = await apiClient.get(`${API_URL}/products`);
  return response.data;
};

export const createProduct = async (name: string, description: string, price: number, weight: number, category: string) => {
    const response = await apiClient.post(`${API_URL}/products`, {
        name,
        description,
        price,
        weight,
        category,
    });
    return response.data;
};

export const getProduct = async (id: string) => {
    const response = await apiClient.get(`${API_URL}/products/${id}`);
    return response.data;
};

export const updateProduct = async (id: string, name: string, description: string, price: number, weight: number, category: string) => {
    const response = await apiClient.put(`${API_URL}/products/${id}`, {
        name,
        description,
        price,
        weight,
        category,
    });
    return response.data;
};

export const createSeoDescription = async (id: string) => {
    const response = await apiClient.get(`${API_URL}/products/${id}/ai-description`);
    return response.data;
};
