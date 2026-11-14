# Test Plan

## 1. Strategy

Test at three levels: API validation/authentication, database-backed integration workflows, and manual browser acceptance. The current repository includes a manual test checklist; automated unit/integration coverage is a planned improvement. Do not mark a test as passed until you have run it and recorded evidence from your own machine.

## 2. Environment

- Windows 10/11 with Docker Desktop and VS Code.
- Clean clone of the private repository.
- Docker Compose services: web, api, db.
- Seeded account `admin@mgh.local` / `MGH-Demo-2026!`.

## 3. Test cases

| ID | Scenario | Steps | Expected result | Evidence |
|---|---|---|---|---|
| TC-01 | Clean startup | Run `docker compose up --build` | All three services start; API health returns `status: ok` | Record terminal output |
| TC-02 | Seeded login | Sign in with documented credentials | Dashboard loads | Screenshot / notes |
| TC-03 | Invalid login | Use wrong password | Login rejected; no token saved | Screenshot / API response |
| TC-04 | Protected API | Call `/api/trips` without token | HTTP 401 | curl/Postman output |
| TC-05 | Create trip | Create destination with valid dates | HTTP 201; trip appears after refresh | UI screenshot |
| TC-06 | Invalid date range | End date before start date | HTTP 400 with validation error | API response |
| TC-07 | Meeting association | Add meeting to a trip | Meeting appears beneath trip | UI screenshot |
| TC-08 | Create team entry | Add a Vacation entry | Entry appears in team plan | UI screenshot |
| TC-09 | Vacation approval | Change Pending to Approved / Rejected | New state persists after refresh | UI screenshot |
| TC-10 | Contact management | Add a contact in a city | Contact appears under city heading | UI screenshot |
| TC-11 | Flight search link | Open Google Flights action | Search opens with origin/destination query | Browser check |
| TC-12 | One-pager print | Select traveller and print | Navigation hidden; briefing content visible | PDF / print preview |
| TC-13 | Persistence | Create record, restart containers without `-v` | Record remains | Before/after screenshot |
| TC-14 | JSON export | Click Export data | JSON file downloads and parses | Inspect downloaded JSON |
| TC-15 | Responsive layout | Test desktop and narrow viewport | Navigation/forms remain usable | Screenshots |

## 4. Regression checklist

- Login still works after browser refresh.
- Trip list and dashboard KPIs agree with database records.
- Meeting records remain linked to their parent trip.
- Vacation approval changes only the selected entry.
- Deleting a contact does not delete meetings; its optional relation is set null.
- Deleting a trip cascades its meetings and materials.
- No secrets or local `.env` files are tracked by Git.

## 5. Current execution status

**Not yet executed in this generated project.** Run each test locally and replace this section with date, environment, pass/fail, and evidence paths. Do not fabricate test evidence. Automated tests are a recommended next step for the evaluation bonus.

## 6. Known gaps to test when implemented

- Full JSON import and schema validation.
- Bulk trip and team-plan operations.
- Calendar quarter/month/week drill-down and today marker.
- Multi-browser refresh and concurrent update conflict handling.
- Full one-pager days-per-country totals and materials ownership.
- Meeting material create/update/delete UI.
