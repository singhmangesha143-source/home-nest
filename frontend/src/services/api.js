import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => API.post('/register', data);
export const loginUser = (data) => API.post('/login', data);
export const getProfile = () => API.get('/users/profile');
export const updateProfile = (data) => API.put('/users/update', data);
export const saveRoom = (roomId) => API.post('/users/save-room', { roomId });

// Rooms
export const getRooms = (params) => API.get('/rooms', { params });
export const getRoomById = (id) => API.get(`/rooms/${id}`);
export const createRoom = (data) => API.post('/rooms', data);
export const updateRoom = (id, data) => API.put(`/rooms/${id}`, data);
export const deleteRoom = (id) => API.delete(`/rooms/${id}`);
export const addReview = (id, data) => API.post(`/rooms/${id}/reviews`, data);
export const searchRooms = (params) => API.get('/rooms/search', { params });
export const getRecommendations = (params) => API.get('/rooms/recommendations', { params });

// Bookings
export const bookRoom = (data) => API.post('/book-room', data);
export const getBookings = () => API.get('/bookings');
export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

// Landlords
export const getLandlords = () => API.get('/landlords');
export const createLandlord = (data) => API.post('/landlords', data);
export const verifyLandlord = (id) => API.put(`/landlords/${id}/verify`);

// Admin
export const getAllUsers = () => API.get('/users');
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getAllBookings = () => API.get('/bookings/all');

export default API;
