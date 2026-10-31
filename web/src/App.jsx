import { useEffect, useState } from 'react';
import * as api from './api.js';
import Summary from './components/Summary.jsx';
import SemesterCard from './components/SemesterCard.jsx';

export default function App() {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [semesterName, setSemesterName] = useState('');

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      setState(await action());
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    run(api.getState);
  }, []);

  function handleAddSemester(event) {
    event.preventDefault();
    const name = semesterName.trim();
    if (!name) return;
    setSemesterName('');
    run(() => api.addSemester(name));
  }

  const semesters = state?.semesters ?? [];

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">My Uni</p>
          <h1>CGPA Tracker</h1>
          <p className="subtitle">
            Add each semester, log your courses with credit units and grades, and watch your GPA
            and cumulative CGPA update.
          </p>
        </div>
      </header>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}

      <Summary state={state} />

      <form className="add-semester" onSubmit={handleAddSemester}>
        <label htmlFor="semester-name">New semester</label>
        <div className="add-semester-row">
          <input
            id="semester-name"
            type="text"
            placeholder="e.g. 200 Level — First Semester"
            value={semesterName}
            onChange={(event) => setSemesterName(event.target.value)}
            maxLength={120}
          />
          <button type="submit" className="primary" disabled={busy || !semesterName.trim()}>
            Add semester
          </button>
        </div>
      </form>

      {state === null && !error && <p className="empty">Loading your results…</p>}

      {state !== null && semesters.length === 0 && (
        <p className="empty">
          No semesters yet. Add one above, then list the courses you took in it.
        </p>
      )}

      <div className="semesters">
        {semesters.map((semester) => (
          <SemesterCard
            key={semester.id}
            semester={semester}
            busy={busy}
            onAddCourse={(course) => run(() => api.addCourse(semester.id, course))}
            onUpdateCourse={(courseId, patch) => run(() => api.updateCourse(courseId, patch))}
            onRemoveCourse={(courseId) => run(() => api.removeCourse(courseId))}
            onRemoveSemester={() => run(() => api.removeSemester(semester.id))}
          />
        ))}
      </div>

      <footer className="app-footer">
        Graded on a 5-point scale: A=5, B=4, C=3, D=2, E=1, F=0. Your data is saved on the
        server.
      </footer>
    </div>
  );
}
