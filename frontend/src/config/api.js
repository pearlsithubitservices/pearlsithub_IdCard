const API_BASE = "https://pearlsithub-idcard.onrender.com";

export const apiFetch = (path, options = {}) => {
  return fetch(`${API_BASE}${path}`, options);
};

export const resolveUrl = (path) => {
  if (!path) return path;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
};
