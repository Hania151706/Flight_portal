# Business Requirements Document (BRD)

**Product:** MGH Executive Travel & Team Planning Portal  
**Status:** Baseline draft derived from the supplied assignment brief and fictional HTML prototype  
**Confidentiality:** Strictly confidential; private evaluation use only.

## 1. Business context

The CEO office coordinates executive travel, meetings, team availability, contacts by city, flights, and traveller briefing documents. The supplied prototype places these activities in one browser-based HTML application. Its state is held in browser `localStorage`; sharing is performed through JSON export/import, and its optional Firebase synchronisation is disabled until configured. This creates operational risk: different browsers can hold divergent plans, there is no authoritative server-side data store, and access control is not active by default.

## 2. Problem statement

The executive office needs a single, persistent and controlled workspace for planning trips and meetings while coordinating the wider team's movements. The prototype demonstrates the workflow but is not a robust multi-user product.

## 3. Stakeholders

| Stakeholder | Interest |
|---|---|
| CEO / executive | Accurate itinerary, travel and meeting preparation |
| CEO Office / executive assistant | Own trip planning, coordination, approvals and briefing packs |
| Team members | Accurate visibility of their travel, remote work and leave |
| Meeting owners / relationship managers | Reliable contact and meeting information |
| Evaluator / technical reviewer | Maintainable architecture, clear documentation, reliable local demo |

## 4. Business objectives

1. Centralise CEO trips, meetings, flights, team availability and city contacts.
2. Replace browser-only storage with a persistent server-side database.
3. Provide authenticated access to a shared dataset.
4. Reduce manual coordination through bulk planning and reusable directory records.
5. Generate concise printable one-pagers for travellers.
6. Run consistently on a laptop without requiring conference-room internet access.

## 5. Scope

### In scope

- Sign-in with seeded local demo account.
- Dashboard KPIs: upcoming trips, next departure, total trip days and planned meetings.
- CEO trip creation with destination, origin, dates, project, entity, status, hotel and transport.
- Meetings associated with trips, including person, priority, status, time, attendees, agenda and materials/owners in the data model.
- Flight records and external Google Flights deep links.
- Team travel, option, vacation and remote entries; vacation approval states.
- Contacts grouped by city and searchable/usable for planning.
- Individual printable itinerary view.
- JSON export.
- Docker Compose startup with PostgreSQL migration and demo seeding.

### Out of scope for this baseline

- Booking or purchasing airline tickets/hotels.
- Live airline schedule/pricing APIs.
- Sending real email or calendar invitations.
- Public cloud hosting or internet-dependent services.
- Production identity provider / SSO.
- AI-generated plans. AI must remain optional and cannot write unreviewed content to the database.

## 6. Assumptions and constraints

- All names, organisations, dates and travel examples supplied in the prototype are fictional evaluation data.
- The initial evaluation runs locally using Docker Compose.
- One seeded CEO-office administrator is sufficient for the baseline authentication requirement; finer role separation is a later enhancement.
- The calendar focuses on H2 2026 as described by the brief/prototype.
- A flight deep link is a search convenience, not an airline integration or confirmation of availability.
- Dates without a value represent TBC, not an assumed date.
- The evaluator must be able to start the application without creating external cloud accounts.

## 7. Success criteria

- `docker compose up --build` starts the web client, API and database.
- A reviewer can sign in with the documented seeded account.
- Trip, team-plan, flight and directory data are stored in PostgreSQL and survive container restarts (unless the volume is deleted).
- Invalid date ranges are rejected by the API.
- A user can create a trip and attach a meeting, create team entries, update vacation approval, view flight records and print a traveller brief.
- The source and SDLC documents are present in a private repository.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Conflicting simultaneous edits | Add optimistic concurrency/versioning or transactions before production use |
| Incorrect travel dates | Validate at client and API; retain TBC explicitly |
| Sensitive travel details exposed | Keep repository private; use authentication; do not deploy publicly |
| Offline demo fails due to external services | Keep core workflows local; Google Flights link is optional and requires internet |
| Scope exceeds available time | Prioritise parity checklist and document deferred items honestly |
