import axios from "axios";

const api = axios.create({ baseURL: "/api", withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true;
      try {
        const refresh = localStorage.getItem("refreshToken");
        if (!refresh) throw new Error();
        const { data } = await axios.post(
          "/api/auth/refresh",
          {},
          {
            headers: { Authorization: `Bearer ${refresh}` },
          },
        );
        localStorage.setItem("accessToken", data.accessToken);
        orig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(orig);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;

export const authApi = {
  register: (d: { username: string; email: string; password: string }) =>
    api.post("/auth/register", d),
  login: (d: { email: string; password: string }) => api.post("/auth/login", d),
  me: () => api.get("/auth/me"),
};

export const sessionsApi = {
  start: (d: { subject: string; roomId?: string }) =>
    api.post("/sessions/start", d),
  pause: (id: string) => api.put(`/sessions/${id}/pause`),
  resume: (id: string) => api.put(`/sessions/${id}/resume`),
  stop: (id: string, d: { subject?: string; memo?: string; rating?: number }) =>
    api.put(`/sessions/${id}/stop`, d),
  current: () => api.get("/sessions/current"),
  history: (page = 1) => api.get("/sessions/history", { params: { page } }),
};

export const roomsApi = {
  create: (d: any) => api.post("/rooms", d),
  list: (params?: any) => api.get("/rooms", { params }),
  get: (id: string) => api.get(`/rooms/${id}`),
  join: (id: string, pw?: string) =>
    api.post(`/rooms/${id}/join`, { password: pw }),
  leave: (id: string) => api.post(`/rooms/${id}/leave`),
  delete: (id: string) => api.delete(`/rooms/${id}`),
};

export const statsApi = {
  daily: (days = 7) => api.get("/stats/daily", { params: { days } }),
  weekly: () => api.get("/stats/weekly"),
  subjects: () => api.get("/stats/subjects"),
  heatmap: () => api.get("/stats/heatmap"),
};

export const feedApi = {
  get: (page = 1) => api.get("/feed", { params: { page } }),
  getRoomFeed: (roomId: string, p = 1) =>
    api.get(`/feed/room/${roomId}`, { params: { page: p } }),
  encourage: (activityId: string) => api.post(`/feed/${activityId}/encourage`),
};
