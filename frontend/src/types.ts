export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
export type UrlStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

export interface JobSummary {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  success: number;
  error: number;
}

export interface UrlCheckResult {
  id: string;
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface JobDetails {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheckResult[];
}
