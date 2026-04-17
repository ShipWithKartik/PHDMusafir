import api from './api';

/**
 * Upload a new story with image.
 * @param {FormData} formData  - Fields: title, description, placeVisited, category, tags, image (File)
 * @param {Function} onProgress - Callback(percent: number)
 * @returns {Promise<Object>} Created story data
 */
export const uploadStory = async (formData, onProgress) => {
  const response = await api.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress?.(percent);
      }
    },
  });
  return response.data;
};

/**
 * Update an existing story.
 * @param {string} id - Story ID
 * @param {FormData|Object} data - Fields to update (can include new image as FormData)
 */
export const updateStory = async (id, data) => {
  const isForm = data instanceof FormData;
  const response = await api.patch(`/stories/${id}`, data, {
    headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response.data;
};

/**
 * Delete a story.
 * @param {string} id - Story ID
 */
export const deleteStory = async (id) => {
  const response = await api.delete(`/stories/${id}`);
  return response.data;
};

/**
 * Fetch all stories (flat array or grouped hierarchy).
 * @param {Object} params - Optional: { grouped, city, category }
 */
export const getAllStories = async (params = {}) => {
  const response = await api.get('/stories', { params });
  return response.data;
};

/**
 * Fetch stories created by the logged-in user.
 */
export const getMyStories = async () => {
  const response = await api.get('/stories/my-stories');
  return response.data;
};

/**
 * Fetch cities + category counts for the sidebar.
 */
export const getStoriesMeta = async () => {
  const response = await api.get('/stories/meta');
  return response.data;
};

/**
 * Fetch journey atlas pin data (stories + blogs → location + coordinates + counts).
 */
export const getJourneyPins = async () => {
  const response = await api.get('/stories/map-pins');
  return response.data;
};
