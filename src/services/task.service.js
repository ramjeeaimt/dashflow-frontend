import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

// Responses are wrapped by a global interceptor as { data, statusCode, message }.
const unwrap = (res) => (res?.data?.data !== undefined ? res.data.data : res?.data);

/**
 * Advanced task board API — the `/tasks` controller. Every list item and detail
 * arrives already decorated by the server (assigneeName, isOverdue, rollups),
 * so the UI renders straight from these payloads.
 */
export const taskService = {
  list: async ({ projectId, assigneeId } = {}) => {
    const params = {};
    if (projectId) params.projectId = projectId;
    if (assigneeId) params.assigneeId = assigneeId;
    const data = unwrap(await apiClient.get(API_ENDPOINTS.TASKS.BASE, { params }));
    return Array.isArray(data) ? data : [];
  },

  get: async (id) => unwrap(await apiClient.get(API_ENDPOINTS.TASKS.BY_ID(id))),

  create: async (payload) => unwrap(await apiClient.post(API_ENDPOINTS.TASKS.BASE, payload)),

  update: async (id, payload) =>
    unwrap(await apiClient.put(API_ENDPOINTS.TASKS.BY_ID(id), payload)),

  // Kanban drag: move to a column at a position.
  move: async (id, status, order) =>
    unwrap(await apiClient.patch(API_ENDPOINTS.TASKS.MOVE(id), { status, order })),

  remove: async (id) => unwrap(await apiClient.delete(API_ENDPOINTS.TASKS.BY_ID(id))),

  addComment: async (id, content) =>
    unwrap(await apiClient.post(API_ENDPOINTS.TASKS.COMMENTS(id), { content })),

  logTime: async (id, { hours, note, workDate }) =>
    unwrap(await apiClient.post(API_ENDPOINTS.TASKS.TIME_LOGS(id), { hours, note, workDate })),
};

export default taskService;
