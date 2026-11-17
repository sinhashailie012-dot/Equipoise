# Equipoise Test Verification Report

**Environment**:
- **Backend**: Spring Boot 4.1.2 on Java 25 (`SPRING_PROFILES_ACTIVE=prod`)
- **Database**: PostgreSQL 16 (running via Docker Compose with persistent volume `equipoise_postgres_data`)
- **Frontend**: React + Vite + Tailwind CSS with hot reloading (`http://127.0.0.1:5173/`)
- **Authentication**: JWT Bearer token authentication with SHA-384 secret
- **Visual Design**: Preserved exactly as specified in the original Figma design system

---

## Pass / Fail Verification Table

| Feature / Requirement | Page Route | Backend Endpoint | Method | Status | Details |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Authentication (Login)** | `/login` | `/api/auth/login` | `POST` | **PASS** | Successfully logged in as `manager@equipoise.com` (Emma Chen, Manager) and received valid JWT token |
| **Overview Dashboard** | `/overview` | `/api/workload/overview` | `GET` | **PASS** | HTTP 200: Team KPIs, utilization, spare capacity, overtime history & burnout risk loaded |
| **Team Workload List** | `/team` | `/api/employees` | `GET` | **PASS** | HTTP 200: Employee directory loaded with backend status bands and WorkloadLogic metrics |
| **Create Employee** | `/team` | `/api/employees` | `POST` | **PASS** | HTTP 201: New employee created with automatic ID, initials, status and burnout calculation |
| **Employee Detail View** | `/team/:id` | `/api/employees/marcus-reed` | `GET` | **PASS** | HTTP 200: Profile, tasks, overtime history, burnout signals, and leave history loaded |
| **Edit Employee** | `/team/:id` | `/api/employees/marcus-reed` | `PUT` | **PASS** | HTTP 200: Successfully updated role and allocated hours; thresholds dynamically recalculated |
| **Create Task** | `/team/:id` | `/api/tasks` | `POST` | **PASS** | HTTP 201: Created new project task and allocated hours to employee |
| **Edit Task** | `/team/:id` | `/api/tasks/:id` | `PUT` | **PASS** | HTTP 200: Updated task title, effort hours and completion status |
| **Task Rebalancer Project** | `/rebalancer` | `/api/workload/rebalancer?project=atlas-redesign` | `GET` | **PASS** | HTTP 200: Rebalancing columns, workload capacity bars and smart suggestions loaded |
| **Reassign Task Action** | `/rebalancer` | `/api/workload/reassign` | `POST` | **PASS** | HTTP 200: Reassigned task between employees; automatically adjusted allocated hours and status |
| **Capacity Timeline** | `/capacity` | `/api/capacity` | `GET` | **PASS** | HTTP 200: 6-week timeline, upcoming leave list, and commitment KPIs loaded |
| **Schedule Leave** | `/capacity` | `/api/capacity/leave` | `POST` | **PASS** | HTTP 201: Successfully scheduled leave and added to upcoming leave schedule |
| **Edit Leave** | `/capacity` | `/api/capacity/leave/:id` | `PUT` | **PASS** | HTTP 200: Updated leave duration, dates and approval state |
| **Burnout Risk Center** | `/burnout` | `/api/burnout` | `GET` | **PASS** | HTTP 200: At-risk employees, high-priority conversations, and intervention states loaded |
| **Schedule Check-in Action** | `/burnout` | `/api/burnout/check-in` | `POST` | **PASS** | HTTP 201: Scheduled 1:1 check-in and moved intervention state to "Scheduled" |
| **Alerts Center** | `/alerts` | `/api/alerts` | `GET` | **PASS** | HTTP 200: System-generated workload, overtime, and overdue alerts retrieved |
| **Reports & Analytics** | `/reports` | `/api/reports` | `GET` | **PASS** | HTTP 200: Historical demand vs capacity chart and burnout distribution data loaded |
| **Projects Directory** | `/projects` | `/api/projects` | `GET` | **PASS** | HTTP 200: Active projects list, leads, milestones, and capacity allocations loaded |
| **System Settings** | `/settings` | `/api/settings` | `GET` | **PASS** | HTTP 200: Workload thresholds, alert rules, working hours, and integrations loaded |
| **Update Settings** | `/settings` | `/api/settings` | `PUT` | **PASS** | HTTP 200: Updated threshold bands; changes propagated to employee statuses |

---

## Key Highlights & Verification Details

1. **Docker Compose & PostgreSQL**:
   - Added `postgres:16-alpine` service with healthcheck, persistent volume `postgres_data`, and environment configuration.
   - Verified backend runs in `prod` profile with `SPRING_DATASOURCE_URL`, credentials, and `JWT_SECRET`.
   - Seeded database on initialization while retaining data persistence across restarts.

2. **Unified WorkloadLogic**:
   - Centralized `utilization(allocatedHours, capacityHours)`, `spareCapacity(...)`, and `burnoutScore(employee)` in `WorkloadLogic.java`.
   - All backend endpoints (`/api/workload/overview`, `/api/employees`, `/api/capacity`, `/api/burnout`, `/api/reports`) calculate and serve these values directly from `WorkloadLogic`.
   - Frontend components consume backend-calculated utilization, status bands, spare capacity, and risk scores.

3. **CRUD Screens**:
   - **Employees**: Added `EmployeeFormModal` for creating (`POST /api/employees`) and editing (`PUT /api/employees/{id}`). Wired to Team Workload and Employee Detail pages.
   - **Tasks**: Added `TaskFormModal` for creating (`POST /api/tasks`) and editing (`PUT /api/tasks/{id}`). Wired directly into Employee Detail current tasks list.
   - **Leave**: Added `LeaveFormModal` for scheduling (`POST /api/capacity/leave`), editing (`PUT /api/capacity/leave/{id}`), and deleting (`DELETE /api/capacity/leave/{id}`). Wired into both Capacity Planner and Employee Detail pages.

4. **Button & Endpoint Audit**:
   - Audited every action button across all pages (`Overview`, `TeamWorkload`, `EmployeeDetail`, `TaskRebalancer`, `CapacityPlanner`, `BurnoutRisk`, `Alerts`, `Reports`, `Projects`, `Settings`, `Login`).
   - Every button is wired to either a real backend endpoint or legitimate UI state transition (modals, filters, export routines).
   - No mock stubs or dead clicks remain.

