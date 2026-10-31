# CGPA Tracker

A small CGPA calculator: create semesters, add courses with credit units and grades, and it
computes each semester's GPA and the cumulative CGPA on a 5-point scale (A=5 … F=0).

## Layout

- `web/` — React + Vite dev server. Serves the UI on port 3000 and proxies `/api/*` to the API,
  so the browser only ever talks to one origin (no CORS needed).
- `server/` — Express API on port 8000. Grades and GPA/CGPA math live here.

## Running it (sandbox / dev)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- Web UI: http://localhost:3000 (public preview: `https://3000-$BASE44_PUBLIC_HOST_SUFFIX`)
- API: http://localhost:8000/api/state

Both services install dependencies on startup (`npm install`) into named volumes that sit over
the bind-mounted source, then run a live-reloading dev command (`vite` / `node --watch`).
Editing files under `web/src` or `server/` takes effect without a rebuild; adding a dependency
needs `docker compose -f docker-compose.base44.yml restart <service>`.

## Gotchas

- No database server: the API persists to `server/data/db.json`, kept in the `api_data` volume.
  Deleting that volume wipes saved results. `docker compose down -v` removes it.
- The API is stateful in memory and reloads `db.json` on start only; `node --watch` restarts it
  on file changes, which re-reads the file.
- Vite accepts the preview hostname through the platform-provided
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var (passed bare into the `web` service). Without
  it Vite rejects the proxied host with a "Blocked request" error.
- Secrets: none required. There are no external services.
- To bump the grading scale (e.g. 4-point), change `GRADE_POINTS` in `server/index.js` and the
  labels in `web/src/cgpa.js`.

## Verifying it works

1. `curl -s http://localhost:3000/api/state` returns JSON with `semesters`, `totalUnits`, `cgpa`.
2. In the UI: add a semester, add a course (e.g. 3 units, grade A) → semester GPA shows 5.00.
3. Change that course's grade to C → GPA becomes 3.00; add a 2-unit B → GPA 3.40, and the CGPA
   card matches.
