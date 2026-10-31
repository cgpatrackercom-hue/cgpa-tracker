import { GRADES } from '../api.js';
import CourseForm from './CourseForm.jsx';

export default function SemesterCard({
  semester,
  busy,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  onRemoveSemester,
}) {
  return (
    <section className="semester">
      <header className="semester-header">
        <div>
          <h2>{semester.name}</h2>
          <p className="semester-meta">
            {semester.courses.length} course{semester.courses.length === 1 ? '' : 's'} ·{' '}
            {semester.units} credit units
          </p>
        </div>
        <div className="semester-actions">
          <span className="gpa-badge">
            GPA <strong>{semester.units ? semester.gpa.toFixed(2) : '—'}</strong>
          </span>
          <button
            type="button"
            className="ghost danger"
            onClick={onRemoveSemester}
            disabled={busy}
            aria-label={`Delete ${semester.name}`}
          >
            Delete
          </button>
        </div>
      </header>

      {semester.courses.length > 0 && (
        <table className="courses">
          <thead>
            <tr>
              <th scope="col">Course</th>
              <th scope="col">Units</th>
              <th scope="col">Grade</th>
              <th scope="col">Points</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {semester.courses.map((course) => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>{course.units}</td>
                <td>
                  <select
                    className="grade-select"
                    aria-label={`Grade for ${course.name}`}
                    value={course.grade}
                    onChange={(event) => onUpdateCourse(course.id, { grade: event.target.value })}
                    disabled={busy}
                  >
                    {GRADES.map((letter) => (
                      <option key={letter} value={letter}>
                        {letter}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{(course.gradePoints * course.units).toFixed(0)}</td>
                <td className="row-actions">
                  <button
                    type="button"
                    className="ghost danger"
                    onClick={() => onRemoveCourse(course.id)}
                    disabled={busy}
                    aria-label={`Remove ${course.name}`}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CourseForm onAddCourse={onAddCourse} />
    </section>
  );
}
