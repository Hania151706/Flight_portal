# Product Requirements Document (PRD)

## 1. Product summary

A responsive internal portal for the CEO office to coordinate travel, meetings, team movements, contacts and individual briefing packs. PostgreSQL is the source of truth; the browser is a client of an authenticated REST API.

## 2. Personas

- **Executive assistant (primary):** creates and updates CEO trips, arranges meetings, assigns preparation materials and checks team availability.
- **CEO (consumer):** reviews itinerary, flights, meeting agendas and one-pagers.
- **Team member (secondary):** needs accurate travel/leave visibility and vacation approval status.
- **Evaluator / administrator:** starts the system locally, inspects data and validates technical decisions.

## 3. User stories and acceptance criteria

| ID | User story | Acceptance criteria | Priority |
|---|---|---|---|
| US-01 | As an office user, I can sign in | Valid seeded credentials return a token; invalid credentials return 401 | Must |
| US-02 | I can see an operational overview | KPI cards show trip, travel-day, meeting and team-entry counts | Must |
| US-03 | I can create a CEO trip | Destination required; end date cannot precede start date; trip persists after reload | Must |
| US-04 | I can add meetings to a trip | Meeting stores contact/person, priority, status, time, agenda and attendees | Must |
| US-05 | I can manage flight options | Flight segments persist and provide a prefilled external flight-search link | Must |
| US-06 | I can plan team movements | Entries support Trip, Option, Vacation and Remote types | Must |
| US-07 | I can process vacation decisions | Approval can be Pending, Approved or Rejected | Must |
| US-08 | I can maintain city contacts | Contact includes city and name; list is grouped by city; deletion is supported | Must |
| US-09 | I can prepare a traveller one-pager | Select a person and print a trip/meeting summary | Must |
| US-10 | I can export planning data | Authenticated export returns a JSON snapshot | Should |
| US-11 | I can drill into the calendar | Half-year → quarter → month → week, filtered by person, with today marker | Should (deferred) |
| US-12 | I can bulk-add multiple trips/team entries | Multiple records can be submitted in one operation | Should (deferred) |
| US-13 | Two browsers see consistent changes | Server remains the source of truth; polling or push refreshes the second client | Should (deferred) |

## 4. Functional requirements

### Authentication
- API routes except health and login require a valid bearer JWT.
- Passwords are stored as bcrypt hashes.
- Demo token lifetime is eight hours.

### Dashboard
- Upcoming trip count uses future/undated trips.
- Travel days are calculated from inclusive trip date ranges where dates exist.
- Meeting count is derived from persisted meeting rows.

### Trip planning
- Required destination, optional origin/project/entity/status/hotel/transport.
- Dates are stored as timestamps and validated so end is not earlier than start.
- A trip may have zero or more meetings and flights.

### Meetings
- Meeting belongs to a trip and may link to a directory contact.
- Store order, priority, status, local time, agenda and attending team member names.
- Store meeting materials and owners as child records.

### Team plan
- Entry belongs to a person and has date range, destination, type, notes and optional vacation approval.
- Vacation states are Pending, Approved and Rejected.

### Directory
- Contacts are grouped by city and contain name, organisation, title and optional email.
- Directory is the intended source for the trip meeting picker. The baseline UI currently supports listing and adding contacts; direct contact-to-meeting selection/edit is an enhancement.

### Flights
- Store origin, destination, date, flight number, departure/arrival times, aircraft and status.
- Google Flights is opened as an external search; no live schedule or fare is guaranteed.

### One-pagers
- Print selected person's relevant trip and meeting information.
- Full days-per-country aggregation and richer hotel/transport/material checklist are a follow-on requirement.

## 5. Non-functional requirements

- **Security:** password hashing, JWT-protected API, Helmet headers, request validation, no secrets committed.
- **Persistence:** PostgreSQL volume persists data between container restarts.
- **Portability:** Docker Compose is the local runtime entry point.
- **Maintainability:** separate frontend, API, schema, migration, seed and docs.
- **Usability:** responsive layout and clear status labels.
- **Offline readiness:** app core does not require a hosted service; Docker images/dependencies must be downloaded before an offline presentation. External Google Flights links require internet.

## 6. MoSCoW prioritisation

- **Must:** auth, persistent database, dashboard, trips, meetings, flights, team plan, vacation approval, directory, printable briefing, Docker.
- **Should:** calendar drill-down/today marker, bulk entry, full import, audit history, richer one-pager totals, live refresh.
- **Could:** role-specific permissions, Mailpit email, local AI draft assistant, automated browser tests and CI.
- **Won't for baseline:** booking tickets, payment, public deployment, live airline data integration.

## 7. UX and navigation

Left navigation groups the workspace into Overview, Team Calendar, Trip Planner, Flights, Team Plan, Directory and One-pagers. Creation forms are contextual and use explicit status choices. Destructive actions should require confirmation. Print styles hide navigation and controls.

## 8. Deliberate prototype deviations

- Replaced the single-page HTML/localStorage state with React, REST API and PostgreSQL.
- Replaced optional disabled Firebase sync with an authenticated API and shared database.
- Modernised navigation and visual design.
- Replaced browser-only save with immediate API persistence.
- Kept Google Flights as a search deep link; it does not claim booking or live schedule integration.
- The prototype's half-year/quarter/month/week calendar drill-down is simplified to a month grid in this baseline; drill-down and today marker remain planned.
- Prototype bulk trip/team entry and full JSON import are deferred. JSON export is included.
- Seed data is a representative fictional subset, not a claim that every prototype record has been migrated.
- The current one-pager is a printable summary; days-per-country calculations and full per-person travel logic need completion.

## 9. Release acceptance

The release is acceptable for a local baseline demo when all Must-priority stories are exercised, the documented Docker startup works from a clean clone, and deferred requirements are clearly disclosed rather than represented as complete.
