const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error || `Request failed (${response.status})`);
  }

  return response.json();
}

export const getState = () => request('/api/state');

export const addSemester = (name) =>
  request('/api/semesters', { method: 'POST', body: JSON.stringify({ name }) });

export const removeSemester = (id) =>
  request(`/api/semesters/${id}`, { method: 'DELETE' });

export const addCourse = (semesterId, course) =>
  request(`/api/semesters/${semesterId}/courses`, {
    method: 'POST',
    body: JSON.stringify(course),
  });

export const updateCourse = (id, patch) =>
  request(`/api/courses/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

export const removeCourse = (id) =>
  request(`/api/courses/${id}`, { method: 'DELETE' });

export { GRADES };
