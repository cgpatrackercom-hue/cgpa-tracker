import express from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.PORT || 8000);
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// 5-point Nigerian grading scale (A=5 ... F=0).
const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

let db = { semesters: [] };
let writeQueue = Promise.resolve();

const round2 = (value) => Math.round(value * 100) / 100;

async function loadDb() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const parsed = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
    db = { semesters: Array.isArray(parsed.semesters) ? parsed.semesters : [] };
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(`[api] could not read ${DB_FILE}:`, err.message);
    db = { semesters: [] };
  }
}

function saveDb() {
  const snapshot = JSON.stringify(db, null, 2);
  writeQueue = writeQueue
    .then(async () => {
      const tmp = `${DB_FILE}.tmp`;
      await fs.writeFile(tmp, snapshot);
      await fs.rename(tmp, DB_FILE);
    })
    .catch((err) => console.error('[api] could not write data file:', err.message));
  return writeQueue;
}

function toView() {
  let totalUnits = 0;
  let totalPoints = 0;

  const semesters = db.semesters.map((semester) => {
    let units = 0;
    let points = 0;
    const courses = semester.courses.map((course) => {
      const gradePoints = GRADE_POINTS[course.grade] ?? 0;
      units += course.units;
      points += gradePoints * course.units;
      return { ...course, gradePoints };
    });
    totalUnits += units;
    totalPoints += points;
    return {
      id: semester.id,
      name: semester.name,
      courses,
      units,
      gpa: units ? round2(points / units) : 0,
    };
  });

  return {
    semesters,
    totalUnits,
    cgpa: totalUnits ? round2(totalPoints / totalUnits) : 0,
    gradeScale: GRADE_POINTS,
  };
}

const cleanName = (value) => (typeof value === 'string' ? value.trim().slice(0, 120) : '');
const cleanUnits = (value) => {
  const units = Number(value);
  return Number.isInteger(units) && units >= 1 && units <= 30 ? units : null;
};
const cleanGrade = (value) => (value && Object.hasOwn(GRADE_POINTS, value) ? value : null);

const findCourse = (courseId) => {
  for (const semester of db.semesters) {
    const course = semester.courses.find((entry) => entry.id === courseId);
    if (course) return { semester, course };
  }
  return null;
};

const app = express();
app.use(express.json());

app.get('/api/state', (req, res) => {
  res.json(toView());
});

app.post('/api/semesters', async (req, res) => {
  const name = cleanName(req.body?.name);
  if (!name) return res.status(400).json({ error: 'Semester name is required.' });

  db.semesters.push({ id: randomUUID(), name, courses: [] });
  await saveDb();
  res.status(201).json(toView());
});

app.delete('/api/semesters/:id', async (req, res) => {
  const remaining = db.semesters.filter((semester) => semester.id !== req.params.id);
  if (remaining.length === db.semesters.length) {
    return res.status(404).json({ error: 'Semester not found.' });
  }
  db.semesters = remaining;
  await saveDb();
  res.json(toView());
});

app.post('/api/semesters/:id/courses', async (req, res) => {
  const semester = db.semesters.find((entry) => entry.id === req.params.id);
  if (!semester) return res.status(404).json({ error: 'Semester not found.' });

  const name = cleanName(req.body?.name);
  const units = cleanUnits(req.body?.units);
  const grade = cleanGrade(req.body?.grade);
  if (!name) return res.status(400).json({ error: 'Course name is required.' });
  if (units === null) return res.status(400).json({ error: 'Credit units must be a whole number from 1 to 30.' });
  if (!grade) return res.status(400).json({ error: 'Choose a grade from A to F.' });

  semester.courses.push({ id: randomUUID(), name, units, grade });
  await saveDb();
  res.status(201).json(toView());
});

app.patch('/api/courses/:id', async (req, res) => {
  const found = findCourse(req.params.id);
  if (!found) return res.status(404).json({ error: 'Course not found.' });

  const patch = {};
  if (req.body?.name !== undefined) {
    const name = cleanName(req.body.name);
    if (!name) return res.status(400).json({ error: 'Course name is required.' });
    patch.name = name;
  }
  if (req.body?.units !== undefined) {
    const units = cleanUnits(req.body.units);
    if (units === null) return res.status(400).json({ error: 'Credit units must be a whole number from 1 to 30.' });
    patch.units = units;
  }
  if (req.body?.grade !== undefined) {
    const grade = cleanGrade(req.body.grade);
    if (!grade) return res.status(400).json({ error: 'Choose a grade from A to F.' });
    patch.grade = grade;
  }

  Object.assign(found.course, patch);
  await saveDb();
  res.json(toView());
});

app.delete('/api/courses/:id', async (req, res) => {
  const found = findCourse(req.params.id);
  if (!found) return res.status(404).json({ error: 'Course not found.' });

  found.semester.courses = found.semester.courses.filter((course) => course.id !== req.params.id);
  await saveDb();
  res.json(toView());
});

await loadDb();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] listening on http://0.0.0.0:${PORT} (data: ${DB_FILE})`);
});
