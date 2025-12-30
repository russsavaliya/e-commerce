import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { getAdminToken } from './authService';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.admin_token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Create a new note
 */
export const createNote = async (noteData) => {
  try {
    const response = await api.post('/notes/create', noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all notes
 */
export const getAllNotes = async () => {
  try {
    const response = await api.get('/notes/list');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single note by ID
 */
export const getNoteById = async (noteId) => {
  try {
    const response = await api.get(`/notes/one/${noteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update note by ID
 */
export const updateNote = async (noteId, noteData) => {
  try {
    const response = await api.put(`/notes/update/${noteId}`, noteData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete note by ID
 */
export const deleteNote = async (noteId) => {
  try {
    const response = await api.delete(`/notes/delete/${noteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
