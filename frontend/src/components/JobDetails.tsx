import { useEffect } from 'react';
import { finalStatuses, useJobsStore } from '../store/jobsStore';

export function JobDetails() {
  const activeJob = useJobsStore((state) => state.activeJob);
  const activeJobId = useJobsStore((state) => state.activeJobId);
  const refreshActiveJob = useJobsStore((state) => state.refreshActiveJob);
  const cancelActiveJob = useJobsStore((state) => state.cancelActiveJob);

  useEffect(() => {
    if (!activeJobId) return;

    let cancelled = false;
    const pollJobId = activeJobId;

    const tick = async () => {
      if (cancelled) return;
      await refreshActiveJob(pollJobId);
    };

    const timer = window.setInterval(() => {
      const current = useJobsStore.getState().activeJob;
      if (current && finalStatuses.includes(current.status)) {
        window.clearInterval(timer);
        return;
      }
      void tick();
    }, 1500);

    void tick();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [activeJobId, refreshActiveJob]);

  if (!activeJob) {
    return (
      <section className="card">
        <h2>Детали задания</h2>
        <p>Выберите задание из списка.</p>
      </section>
    );
  }

  const processed = activeJob.urls.filter((item) =>
    ['success', 'error', 'cancelled'].includes(item.status),
  ).length;
  const isFinal = finalStatuses.includes(activeJob.status);

  return (
    <section className="card details">
      <div className="details-header">
        <div>
          <h2>Детали задания</h2>
          <p className="muted">{activeJob.id}</p>
        </div>
        <button disabled={isFinal} onClick={() => void cancelActiveJob()}>
          Отменить задание
        </button>
      </div>

      <p>
        Статус: <span className={`badge ${activeJob.status}`}>{activeJob.status}</span>
      </p>
      <p>
        Прогресс: {processed} из {activeJob.urls.length}
      </p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Статус</th>
              <th>HTTP</th>
              <th>Ошибка</th>
              <th>Длительность</th>
            </tr>
          </thead>
          <tbody>
            {activeJob.urls.map((item) => (
              <tr key={item.id}>
                <td className="url-cell">{item.url}</td>
                <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                <td>{item.httpStatus ?? '-'}</td>
                <td>{item.errorMessage ?? '-'}</td>
                <td>{item.durationMs ? `${item.durationMs} ms` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
