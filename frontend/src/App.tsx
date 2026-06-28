import { CreateJobForm } from './components/CreateJobForm';
import { JobDetails } from './components/JobDetails';
import { JobsList } from './components/JobsList';
import { useJobsStore } from './store/jobsStore';
import './styles.css';

export function App() {
  const error = useJobsStore((state) => state.error);

  return (
    <main className="page">
      <header>
        <h1>URL Checker</h1>
        <p>Асинхронная проверка списка URL через HTTP HEAD-запросы.</p>
      </header>

      {error && <div className="error-alert">{error}</div>}

      <div className="layout">
        <div className="left-column">
          <CreateJobForm />
          <JobsList />
        </div>
        <JobDetails />
      </div>
    </main>
  );
}
