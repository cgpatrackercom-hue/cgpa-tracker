import { useState } from 'react';
import { GRADES } from '../api.js';
import { GRADE_LABELS, UNIT_OPTIONS } from '../cgpa.js';

export default function CourseForm({ onAddCourse }) {
  const [name, setName] = useState('');
  const [units, setUnits] = useState('3');
  const [grade, setGrade] = useState('A');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!name.trim() || saving) return;

    setSaving(true);
    const added = await onAddCourse({ name: name.trim(), units: Number(units), grade });
    setSaving(false);

    if (added) {
      setName('');
      setGrade('A');
    }
  }

  return (
    <form className="course-form" onSubmit={handleSubmit}>
      <input
        type="text"
        aria-label="Course name"
        placeholder="Course name (e.g. MTH 101)"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={120}
      />
      <select aria-label="Credit units" value={units} onChange={(event) => setUnits(event.target.value)}>
        {UNIT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option} unit{option > 1 ? 's' : ''}
          </option>
        ))}
      </select>
      <select aria-label="Grade" value={grade} onChange={(event) => setGrade(event.target.value)}>
        {GRADES.map((letter) => (
          <option key={letter} value={letter}>
            {letter}
          </option>
        ))}
      </select>
      <button type="submit" className="primary" disabled={saving || !name.trim()}>
        Add course
      </button>
      <span className="grade-hint" aria-hidden="true">
        {GRADE_LABELS[grade]}
      </span>
    </form>
  );
}
