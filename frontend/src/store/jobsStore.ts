import { create } from 'zustand';
import { jobsApi } from '../api/jobsApi';
import { JobDetails, JobStatus, JobSummary } from '../types';

interface JobsState {
  jobs: JobSummary[];
  activeJobId?: string;
  activeJob?: JobDetails;
  loading: boolean;
  error?: string;
  loadJobs: () => Promise<void>;
  createJob: (urls: string[]) => Promise<void>;
  selectJob: (jobId: string) => Promise<void>;
  refreshActiveJob: (jobId: string) => Promise<void>;
  cancelActiveJob: () => Promise<void>;
}

export const finalStatuses: JobStatus[] = ['completed', 'cancelled', 'failed'];

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  loading: false,

  loadJobs: async () => {
    try {
      const jobs = await jobsApi.list();
      set({ jobs, error: undefined });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load jobs' });
    }
  },

  createJob: async (urls: string[]) => {
    set({ loading: true, error: undefined });
    try {
      const { jobId } = await jobsApi.create(urls);
      set({ activeJobId: jobId });
      await get().loadJobs();
      await get().refreshActiveJob(jobId);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create job' });
    } finally {
      set({ loading: false });
    }
  },

  selectJob: async (jobId: string) => {
    set({ activeJobId: jobId, activeJob: undefined, error: undefined });
    await get().refreshActiveJob(jobId);
  },

  refreshActiveJob: async (jobId: string) => {
    try {
      const details = await jobsApi.details(jobId);
      if (get().activeJobId !== jobId) return;
      set({ activeJob: details, error: undefined });
      await get().loadJobs();
    } catch (error) {
      if (get().activeJobId !== jobId) return;
      set({ error: error instanceof Error ? error.message : 'Failed to load job details' });
    }
  },

  cancelActiveJob: async () => {
    const jobId = get().activeJobId;
    if (!jobId) return;

    try {
      const details = await jobsApi.cancel(jobId);
      if (get().activeJobId !== jobId) return;
      set({ activeJob: details, error: undefined });
      await get().loadJobs();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to cancel job' });
    }
  },
}));
