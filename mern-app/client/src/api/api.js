import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const uploadPaper = (formData) => {
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const sendMessage = (sessionId, question) => {
  return api.post('/chat', { sessionId, question });
};

export const getSummary = (sessionId) => {
  return api.post('/summarize', { sessionId });
};

export const getKeyPoints = (sessionId) => {
  return api.post('/keypoints', { sessionId });
};

export const getChatHistory = (sessionId) => {
  return api.get(`/history/${sessionId}`);
};

export default api;
