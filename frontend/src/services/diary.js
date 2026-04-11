import api from './api';

export const diaryService = {
  // Get all diaries
  getAll: async () => {
    const response = await api.get('/diaries');
    return response.data.data.diaries;
  },

  // Create new diary
  create: async (title, content, mood, isPrivate, tags, imageURLs) => {
    const response = await api.post('/diaries', {
      title,
      content,
      mood: mood || 'neutral',
      is_private: isPrivate,
      tags: tags || '',
      image_urls: imageURLs || [],
    });
    return response.data.data;
  },

  // Get single diary by ID
  getById: async (id) => {
    const response = await api.get(`/diaries/${id}`);
    return response.data.data;
  },

  // Search diaries by filter object
  search: async (filter) => {
    const params = new URLSearchParams();
    if (filter.keyword) params.append('keyword', filter.keyword);
    if (filter.mood) params.append('mood', filter.mood);
    if (filter.tags) params.append('tags', filter.tags);
    if (filter.startDate) params.append('start_date', filter.startDate);
    if (filter.endDate) params.append('end_date', filter.endDate);
    if (filter.page) params.append('page', filter.page);
    if (filter.pageSize) params.append('page_size', filter.pageSize);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/diaries/search${queryString}`);
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
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/diaries/statistics');
    return response.data.data;
  },

  // Upload an image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Trả về public url do API cung cấp
    return response.data.data.url;
  }
};
