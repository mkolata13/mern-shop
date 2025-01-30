import { API_URL } from "./api.config";
import apiClient from "./axiosClient";

interface OrderItem {
  product: string;
  amount: number;
}

export const getOrders = async () => {
  const response = await apiClient.get(`${API_URL}/orders`);
  return response.data;
};

export const createOrder = async (username: string, email: string, phoneNumber: string, items: OrderItem[]) => {
  const response = await apiClient.post(`${API_URL}/orders`, {
    username,
    email,
    phoneNumber,
    items,
  });
  return response.data;
};

export const getOrdersWithStatus = async (statusId: string) => {
  const response = await apiClient.get(`${API_URL}/orders/${statusId}`);
  return response.data;
};

export const updateOrder = async (id: string, status: string) => {
  const response = await apiClient.patch(`${API_URL}/orders/${id}`, {
    "status": status,
  });
  return response.data;
};

export const addOpinionToOrder = async (id: string, rating: number, content: string) => {
  const response = await apiClient.post(`${API_URL}/orders/${id}/opinions`, {
    rating,
    content,
  });
  return response.data;
};
