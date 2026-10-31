import { classification, cgpaClass } from '../cgpa.js';

export default function Summary({ state }) {
  const totalUnits = state?.totalUnits ?? 0;
  const cgpa = state?.cgpa ?? 0;
  const semesterCount = state?.semesters.length ?? 0;

  return (
    <section className="summary" aria-label="Result summary">
      <div className={`summary-main ${cgpaClass(cgpa)}`}>
        <span className="summary-label">CGPA</span>
        <strong className="summary-value">{totalUnits ? cgpa.toFixed(2) : '—'}</strong>
        <span className="summary-note">{classification(cgpa, totalUnits > 0)}</span>
      </div>
      <div className="summary-stat">
        <span className="summary-label">Credit units</span>
        <strong className="summary-value">{totalUnits}</strong>
      </div>
      <div className="summary-stat">
        <span className="summary-label">Semesters</span>
        <strong className="summary-value">{semesterCount}</strong>
      </div>
    </section>
  );
}
