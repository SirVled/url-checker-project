import { JobDetails, JobSummary } from '../types';

const API_BASE = '/api/jobs';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const jobsApi = {
  create: (urls: string[]) =>
    request<{ jobId: string }>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({ urls }),
    }),

  list: () => request<JobSummary[]>(API_BASE),

  details: (jobId: string) => request<JobDetails>(`${API_BASE}/${jobId}`),

  cancel: (jobId: string) =>
    request<JobDetails>(`${API_BASE}/${jobId}`, { method: 'DELETE' }),
};
