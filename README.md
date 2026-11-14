# MGH Executive Travel & Team Planning Portal

**Confidential hiring-assignment implementation. Keep this repository private.** Do not publish, deploy publicly, or share the assignment or this implementation outside the authorised evaluation process.

## What is included

A local client–server application with React/Vite, Express REST API, PostgreSQL, Prisma migrations, seeded demo data, JWT sign-in, and Docker Compose. Current screens cover overview KPIs, trip creation and meeting details, flight records and Google Flights deep links, team-plan entries and vacation approval, a city-grouped directory, a basic June–December team calendar, printable one-pagers, and JSON export.

The prototype/brief also expects calendar drill-down (half-year/quarter/month/week and today marker), bulk trip creation, bulk team entry, complete meeting material editing, contact editing, full JSON import, richer one-pager days-per-country totals, multi-user concurrency handling, and additional automated tests. These are explicitly tracked as next implementation work in `docs/PRD.md` and `docs/TEST_PLAN.md`; do not present them as completed.

## Prerequisites

- Docker Desktop (with Docker Compose v2) installed and running.
- VS Code.
- Git.

No local Node.js or PostgreSQL installation is required when using Docker.

## Run locally

From the repository root in the VS Code terminal:

```bash
docker compose up --build
```

Wait for the API and web containers to start, then open:

- Web application: http://localhost:5173
- API health check: http://localhost:4000/api/health

The API container waits for PostgreSQL, applies Prisma migrations, seeds demo data, and then starts the server.

## Demo login

- Email: `admin@mgh.local`
- Password: `MGH-Demo-2026!`

These credentials are fictional local-evaluation credentials. Change them and the JWT secret before any non-demo use.

## Stop / reset

```bash
docker compose down
```

To delete the local database volume and recreate the seeded database:

```bash
docker compose down -v
docker compose up --build
```

The `-v` command permanently deletes the local PostgreSQL data. Use it only when you intentionally want a clean reset.

## Useful commands

```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db
```

## Project structure

```text
mgh-portal/
├── client/                 # React + Vite frontend
│   ├── src/main.jsx        # Routes, screens, forms and API calls
│   ├── src/style.css       # Responsive styling
│   ├── Dockerfile
│   └── package.json
├── server/                 # Express REST API
│   ├── prisma/
│   │   ├── migrations/     # Versioned SQL migration
│   │   ├── schema.prisma   # Relational data model
│   │   └── seed.js         # Fictional demo records
│   ├── src/index.js        # API routes, auth and validation
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── BRD.md
│   ├── PRD.md
│   ├── TRD.md
│   ├── TEST_PLAN.md
│   └── ADR-001-stack.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## Troubleshooting

- **Docker command not found:** install/start Docker Desktop and reopen the terminal.
- **Port already in use:** stop the other process using 5173 or 4000, or change the host-side port mapping in `docker-compose.yml`.
- **Database connection error:** check `docker compose ps`; the API starts only after the database health check passes. Inspect `docker compose logs db` and `docker compose logs api`.
- **Login fails after a previous database run:** reset only if acceptable using `docker compose down -v`, then start again.
- **Frontend cannot reach API:** verify `VITE_API_URL` and that port 4000 is reachable.
- **Changes are not reflected:** rebuild the relevant image with `docker compose up --build`.

## Confidentiality and Git

Create a **private** GitHub/GitLab repository. Never enable public visibility, Pages, public deployments, or public artifacts. Add only the requested evaluator collaborator. Do not commit `.env` files, access tokens, real personal data, or credentials other than the explicitly fictional seeded local demo credentials.

## Documentation

Read the documents in `docs/` in this order: BRD → PRD → TRD → TEST_PLAN → ADR. They explain the business need, product decisions, technical design, and verification approach.
