import axios from 'axios';
import type { CreateRoomRequest, Room } from '../types/room';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  },
);

export const roomService = {
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const response = await api.post<Room>('/rooms', data);
    return response.data;
  },

  async getAllRooms(): Promise<Room[]> {
    const response = await api.get<Room[]>('/rooms');
    return response.data;
  },

  async getRoomBySlug(slug: string): Promise<Room> {
    const response = await api.get<Room>(`/rooms/${slug}`);
    return response.data;
  },
};

export type { CreateRoomRequest, Room };
