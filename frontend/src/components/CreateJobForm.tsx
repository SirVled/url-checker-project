import { FormEvent, useState } from 'react';
import { useJobsStore } from '../store/jobsStore';

export function CreateJobForm() {
  const [value, setValue] = useState('https://example.com\nhttps://github.com');
  const createJob = useJobsStore((state) => state.createJob);
  const loading = useJobsStore((state) => state.loading);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const urls = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (urls.length === 0) return;
    await createJob(urls);
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Создать задание</h2>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={8}
        placeholder="Каждый URL с новой строки"
      />
      <button disabled={loading}>{loading ? 'Запускаю...' : 'Запустить проверку'}</button>
    </form>
  );
}
