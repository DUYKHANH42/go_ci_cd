import api from './api';

export const diaryService = {
  // Get all diaries
  getAll: async () => {
    const response = await api.get('/diaries');
    return response.data.data.diaries;
  },

  // Create new diary
  create: async (title, content, mood, isPrivate) => {
    const response = await api.post('/diaries', {
      title,
      content,
      mood: mood || 'neutral',
      is_private: isPrivate,
    });
    return response.data.data;
  },

  // Get single diary by ID
  getById: async (id) => {
    const response = await api.get(`/diaries/${id}`);
    return response.data.data;
  },

  // Search diaries by query
  search: async (query) => {
    const response = await api.get(`/diaries/search?q=${encodeURIComponent(query)}`);
    return response.data.data.diaries;
  },

  // Update a diary
  update: async (id, data) => {
    const response = await api.put(`/diaries/${id}`, data);
    return response.data.data;
  },

  // Delete a diary
  delete: async (id) => {
    const response = await api.delete(`/diaries/${id}`);
    return response.data.data;
  }
};
