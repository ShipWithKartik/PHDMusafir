import api from './api';

/**
 * Replace a story's cover image (admin, or the story's owner).
 * Resolves with { image, imagePublicId } from the updated story.
 */
export const replaceStoryCover = async (storyId, file) => {
  const form = new FormData();
  form.append('image', file);
  const res = await api.patch(`/stories/${storyId}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const { image, imagePublicId } = res.data.data;
  return { image, imagePublicId };
};

/**
 * Replace a published post's cover image (admin only).
 * Resolves with the post's new `images` array.
 */
export const replacePostCover = async (blogId, file) => {
  const form = new FormData();
  form.append('images', file);
  const res = await api.put(`/admin/blogs/${blogId}/edit`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.images;
};
