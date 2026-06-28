import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Job, JobSummary, UrlCheckResult } from './jobs.types';

const CONCURRENCY_PER_JOB = 5;
const REQUEST_TIMEOUT_MS = 10000;

@Injectable()
export class JobsService {
  private readonly jobs = new Map<string, Job>();

  create(urls: string[]): Job {
    const job: Job = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      urls: urls.map((url) => ({ id: randomUUID(), url, status: 'pending' })),
    };

    this.jobs.set(job.id, job);
    void this.processJob(job.id);
    return job;
  }

  findAll(): JobSummary[] {
    return [...this.jobs.values()]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map((job) => this.toSummary(job));
  }

  findOne(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  cancel(id: string): Job | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    if (this.isFinalStatus(job.status)) return job;

    job.status = 'cancelled';
    for (const item of job.urls) {
      if (item.status === 'pending') {
        item.status = 'cancelled';
        item.finishedAt = new Date().toISOString();
      }
    }

    return job;
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    if (job.status === 'cancelled') return;

    job.status = 'in_progress' as Job['status'];
    let cursor = 0;

    const worker = async () => {
      while (true) {
        if (job.status === 'cancelled') return;

        const index = cursor++;
        const item = job.urls[index];
        if (!item) return;

        if (item.status !== 'pending') continue;
        await this.processUrl(job, item);
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY_PER_JOB, job.urls.length) }, worker));

    if (job.status === 'cancelled') return;

    const hasPending = job.urls.some((item) => item.status === 'pending' || item.status === 'in_progress');
    job.status = hasPending ? 'failed' : 'completed';
  }

  private async processUrl(job: Job, item: UrlCheckResult): Promise<void> {
    item.status = 'in_progress';
    item.startedAt = new Date().toISOString();
    const started = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(item.url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });

      await this.randomDelay();

      if (job.status === 'cancelled') {
        item.status = 'cancelled';
        return;
      }

      item.httpStatus = response.status;
      item.status = response.ok ? 'success' : 'error';
      if (!response.ok) item.errorMessage = `HTTP status ${response.status}`;
    } catch (error) {
      await this.randomDelay();

      if (job.status === 'cancelled') {
        item.status = 'cancelled';
        return;
      }

      item.status = 'error';
      item.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      clearTimeout(timer);
      item.finishedAt = new Date().toISOString();
      item.durationMs = Date.now() - started;
    }
  }

  private randomDelay(): Promise<void> {
    const delayMs = Math.floor(Math.random() * 10001);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  private toSummary(job: Job): JobSummary {
    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      total: job.urls.length,
      success: job.urls.filter((item) => item.status === 'success').length,
      error: job.urls.filter((item) => item.status === 'error').length,
    };
  }

  private isFinalStatus(status: Job['status']): boolean {
    return status === 'completed' || status === 'cancelled' || status === 'failed';
  }
}
