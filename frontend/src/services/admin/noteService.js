import apiClient from '../../utils/api';

/**
 * Create a new note
 */
export const createNote = async (noteData) => {
  try {
    const response = await apiClient.post('/notes/create', noteData);
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
    const response = await apiClient.get('/notes/list');
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
    const response = await apiClient.get(`/notes/one/${noteId}`);
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
    const response = await apiClient.put(`/notes/update/${noteId}`, noteData);
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
    const response = await apiClient.delete(`/notes/delete/${noteId}`);
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
