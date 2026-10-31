export const GRADE_LABELS = {
  A: 'A — 70-100',
  B: 'B — 60-69',
  C: 'C — 50-59',
  D: 'D — 45-49',
  E: 'E — 40-44',
  F: 'F — 0-39',
};

export const UNIT_OPTIONS = [1, 2, 3, 4, 5, 6, 8];

export function cgpaClass(cgpa) {
  if (!cgpa) return 'neutral';
  if (cgpa >= 4.5) return 'great';
  if (cgpa >= 3.5) return 'good';
  if (cgpa >= 2.4) return 'fair';
  return 'low';
}

export function classification(cgpa, hasUnits) {
  if (!hasUnits) return 'Add your courses to see your standing';
  if (cgpa >= 4.5) return 'First Class';
  if (cgpa >= 3.5) return 'Second Class Upper';
  if (cgpa >= 2.4) return 'Second Class Lower';
  if (cgpa >= 1.5) return 'Third Class';
  return 'Pass';
}
