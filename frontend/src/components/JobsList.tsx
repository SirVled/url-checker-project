import { useEffect } from 'react';
import { useJobsStore } from '../store/jobsStore';

export function JobsList() {
  const jobs = useJobsStore((state) => state.jobs);
  const activeJobId = useJobsStore((state) => state.activeJobId);
  const loadJobs = useJobsStore((state) => state.loadJobs);
  const selectJob = useJobsStore((state) => state.selectJob);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  return (
    <section className="card">
      <h2>Последние задания</h2>
      {jobs.length === 0 && <p>Заданий пока нет.</p>}
      <div className="jobs-list">
        {jobs.map((job) => (
          <button
            key={job.id}
            className={job.id === activeJobId ? 'job-item active' : 'job-item'}
            onClick={() => void selectJob(job.id)}
          >
            <span className="job-id">{job.id}</span>
            <span>{new Date(job.createdAt).toLocaleString()}</span>
            <span className={`badge ${job.status}`}>{job.status}</span>
            <span>
              URL: {job.total}; OK: {job.success}; ERR: {job.error}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
