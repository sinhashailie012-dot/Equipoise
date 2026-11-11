# Equipoise API Contract Specification

This document details the RESTful API endpoints for **Equipoise**, the Employee Workload & Burnout Prevention Dashboard. All endpoints adhere to standard HTTP status codes, consistent error envelopes, and JWT Bearer token authentication.

---

## 1. Global Standards & Conventions

### Base URL
- Local Development: `http://localhost:8080/api`
- Production: `/api`

### Authentication Header
Protected endpoints require:
```http
Authorization: Bearer <jwt_access_token>
```

### Standard Error Response Format
All errors (client and server) return a consistent envelope:
```json
{
  "timestamp": "2026-11-10T09:41:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Field 'email' must not be blank",
  "path": "/api/auth/login",
  "validationErrors": [
    {
      "field": "email",
      "rejectedValue": "",
      "message": "must be a well-formed email address"
    }
  ]
}
```

### Standard Pagination Envelope
Endpoints with pagination return:
```json
{
  "content": [ ... ],
  "pageNumber": 0,
  "pageSize": 10,
  "totalElements": 42,
  "totalPages": 5,
  "isLast": false
}
```

---

## 2. Authentication (`/api/auth`)

### 2.1 Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "manager@equipoise.com",
  "password": "Password@123"
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "emma-chen",
    "name": "Emma Chen",
    "email": "manager@equipoise.com",
    "role": "MANAGER",
    "title": "Design manager",
    "initials": "EC",
    "workspace": "Forma Studio",
    "department": "People Operations / Design Team"
  }
}
```
- **Error `401 Unauthorized`**:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid email or password."
}
```

### 2.2 Refresh Token
- **Endpoint**: `POST /api/auth/refresh`
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
- **Response `200 OK`**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

### 2.3 Current User Info
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: (Returns user profile)

### 2.4 Logout
- **Endpoint**: `POST /api/auth/logout`
- **Access**: Authenticated
- **Response `200 OK`**: `{ "success": true }`

---

## 3. Workload & Overview (`/api/workload`)

### 3.1 Overview Dashboard
- **Endpoint**: `GET /api/workload/overview`
- **Query Parameters**:
  - `dateRange` (optional, default `2–8 Nov 2026`)
- **Response `200 OK`**:
```json
{
  "dateRange": "2–8 Nov 2026",
  "kpis": {
    "teamUtilization": { "value": "96%", "note": "306 of 320 hrs allocated", "fraction": "306 / 320" },
    "atRiskEmployees": { "value": "3 of 8", "note": "Risk score above 60" },
    "overdueTasks": { "value": "5", "note": "Across 3 people" },
    "spareCapacity": { "value": "38 hrs", "note": "Available across 4 people" }
  },
  "heatmap": {
    "weeks": ["14 Sep", "21 Sep", "28 Sep", "5 Oct", "12 Oct", "19 Oct", "26 Oct", "2 Nov"],
    "capacity": 40,
    "rows": [
      {
        "id": "asha-patel",
        "name": "Asha Patel",
        "hours": [34, 36, 38, 40, 44, 46, 50, 48]
      }
    ]
  },
  "teamBurnoutRisk": {
    "score": 58,
    "label": "Elevated · 58 / 100",
    "change": "+6 points from last week",
    "insight": "Sustained overtime is the strongest signal. Start with Marcus and Asha."
  },
  "needsAttention": [
    {
      "id": "marcus-reed",
      "name": "Marcus Reed",
      "initials": "MR",
      "allocated": "52 hrs allocated",
      "overdue": "2 overdue",
      "status": "critical"
    }
  ],
  "overtimeHistory": [
    { "week": "Sep 14", "hours": 0 },
    { "week": "Nov 2", "hours": 24 }
  ],
  "recommendation": {
    "title": "A small move could make a real difference.",
    "body": "Move 6 hrs from Asha to Daniel without changing the Atlas deadline.",
    "actionLabel": "Review rebalance",
    "actionRoute": "/rebalancer"
  }
}
```

### 3.2 Task Rebalancer Data
- **Endpoint**: `GET /api/workload/rebalancer`
- **Query Parameters**:
  - `project` (e.g. `atlas-redesign`)
- **Response `200 OK`**:
```json
{
  "project": "Atlas redesign · 3 people",
  "dateRange": "2–8 Nov 2026",
  "suggestion": {
    "id": "sugg-1",
    "taskId": "task-2",
    "title": "Move 6 hrs from Asha to Daniel",
    "taskName": "Research synthesis · Atlas redesign · Due 6 Nov",
    "impactText": "Asha: 48 → 42 hrs · 120% → 105%    Daniel: 28 → 34 hrs · 70% → 85%",
    "matchText": "Skill match: research synthesis · No deadline change"
  },
  "columns": [
    {
      "id": "asha-patel",
      "name": "Asha Patel",
      "initials": "AP",
      "role": "Senior product designer",
      "project": "Atlas redesign",
      "contractedHours": 40,
      "allocatedHours": 48,
      "utilization": 120,
      "status": "overloaded",
      "tasks": [
        {
          "id": "task-1",
          "title": "Checkout interaction spec",
          "hours": 12,
          "due": "6 Nov",
          "status": "In progress",
          "isSuggested": false
        }
      ]
    }
  ]
}
```

### 3.3 Reassign Task
- **Endpoint**: `POST /api/workload/reassign`
- **Request Body**:
```json
{
  "taskId": "task-2",
  "fromEmployeeId": "asha-patel",
  "toEmployeeId": "daniel-kim",
  "notify": true
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "taskId": "task-2",
  "fromEmployeeId": "asha-patel",
  "toEmployeeId": "daniel-kim"
}
```

### 3.4 Accept Suggestion
- **Endpoint**: `POST /api/workload/suggestions/{id}/accept`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Suggestion accepted. 6 hours moved from Asha to Daniel."
}
```

### 3.5 Dismiss Suggestion
- **Endpoint**: `POST /api/workload/suggestions/{id}/dismiss`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Suggestion dismissed."
}
```

---

## 4. Employees (`/api/employees`)

### 4.1 List Employees
- **Endpoint**: `GET /api/employees`
- **Query Parameters**:
  - `search` (string)
  - `tab` (`all` | `at-risk` | `spare`)
  - `team` (string)
  - `sortBy` (`allocation` | `name` | `risk`)
  - `page` (number, default 0)
  - `size` (number, default 20)
- **Response `200 OK`**: List of employee summary objects.
  The response uses the standard pagination envelope above. `page` defaults to `0`; `size` defaults to `20` and is capped at `100`.

### 4.2 Get Employee Detail
- **Endpoint**: `GET /api/employees/{id}`
- **Response `200 OK`**:
```json
{
  "id": "asha-patel",
  "initials": "AP",
  "name": "Asha Patel",
  "role": "Senior product designer",
  "email": "asha.patel@forma.studio",
  "department": "Design",
  "reportsTo": "Emma Chen",
  "allocatedHours": 48,
  "contractedHours": 40,
  "status": "overloaded",
  "riskScore": 82,
  "activeTasks": 7,
  "overdueTasks": 2,
  "nextDeadline": "6 Nov",
  "project": "Atlas redesign",
  "weeklyAllocation": [34, 36, 38, 40, 44, 46, 50, 48],
  "overtimeHistory": [0, 0, 0, 0, 4, 6, 10, 8],
  "managerNotes": "Asha is carrying both discovery and delivery for Atlas. Protect focus time and move synthesis support before Friday.",
  "managerNoteDate": "4 Nov, 15:30",
  "leaveHistory": [
    { "date": "16–17 Nov", "type": "Annual leave", "note": "16 hrs", "status": "Approved" }
  ],
  "tasks": [ ... ]
}
```

### 4.3 Add Manager Note
- **Endpoint**: `POST /api/employees/{id}/notes`
- **Request Body**:
```json
{
  "note": "Asha is carrying both discovery and delivery for Atlas.",
  "author": "Emma Chen"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "employeeId": "asha-patel",
  "note": "Asha is carrying both discovery and delivery for Atlas.",
  "date": "4 Nov, 15:30"
}
```

### 4.4 Update Employee
- **Endpoint**: `PUT /api/employees/{id}`
- **Request Body**: Any supported employee fields (`name`, `role`, `email`, `department`, `allocatedHours`, `contractedHours`, `overdueTasks`, `consecutiveLongWeeks`).
- **Response `200 OK`**: Updated employee summary. Workload status, burnout score and crossed alert rules are recalculated.

---

## 5. Capacity Planner (`/api/capacity`)

### 5.1 Get Capacity Data
- **Endpoint**: `GET /api/capacity`
- **Query Parameters**:
  - `view` (`weeks` | `months`, default `weeks`)
- **Response `200 OK`**:
```json
{
  "kpis": {
    "currentAllocation": { "value": "96%", "note": "Week of 2 November" },
    "nextWeek": { "value": "93%", "note": "296 of 320 hrs committed" },
    "knownLeave": { "value": "24 hrs", "note": "3 days in this horizon" },
    "capacityIn6Weeks": { "value": "68 hrs", "note": "Uncommitted · week of 7 Dec" }
  },
  "weeks": ["2 Nov · now", "9 Nov", "16 Nov", "23 Nov", "30 Nov", "7 Dec"],
  "timeline": [
    {
      "employeeId": "asha-patel",
      "name": "Asha Patel",
      "project": "Atlas redesign",
      "schedule": [
        { "hours": 48, "cap": 40, "status": "overloaded" },
        { "hours": 24, "cap": 24, "status": "balanced", "isLeave": true, "leaveLabel": "24 / 24h · leave" }
      ]
    }
  ],
  "upcomingLeave": [
    { "id": "leave-1", "employee": "Asha Patel", "dates": "16–17 Nov", "type": "Annual leave", "hours": "16 hrs", "status": "Approved" }
  ]
}
```

### 5.2 Add Leave
- **Endpoint**: `POST /api/capacity/leave`
- **Request Body**:
```json
{
  "employee": "Asha Patel",
  "type": "Annual leave",
  "dates": "16–17 Nov",
  "hours": 16
}
```
- **Response `201 Created`**

### 5.3 Add Capacity Allocation
- **Endpoint**: `POST /api/capacity/allocations`
- **Request Body**: `{ "employee": "Asha Patel", "project": "Atlas redesign", "hours": 8, "week": "9 Nov" }`
- **Response `200 OK`**: `{ "success": true, "task": { ... } }`. The allocation is stored as a scheduled task and changes employee capacity.

---

## 6. Burnout Risk Center (`/api/burnout`)

### 6.1 Get Burnout Overview
- **Endpoint**: `GET /api/burnout`
- **Response `200 OK`**: Returns KPIs, conversation candidates (Marcus, Asha, Sofia), driving risk factors, and intervention tracker list.

### 6.2 Schedule 1:1 Check-in
- **Endpoint**: `POST /api/burnout/check-in`
- **Request Body**:
```json
{
  "employeeId": "asha-patel",
  "employeeName": "Asha Patel",
  "date": "Friday, 6 Nov 2026",
  "time": "10:00",
  "duration": "30 minutes",
  "location": "Google Meet",
  "agenda": "A little space to check in\n· How is the workload feeling this week?"
}
```

### 6.3 Update Intervention
- **Endpoint**: `PUT /api/burnout/interventions/{id}`
- **Request Body**: `{ "state": "Scheduled", "due": "6 Nov" }` (either field may be omitted)
- **Response `200 OK`**: Updated intervention object.
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "1:1 check-in scheduled with Asha Patel for Friday, 6 Nov 2026 at 10:00.",
  "checkInId": "checkin-12345"
}
```

---

## 7. Alerts (`/api/alerts`)

### 7.1 List Alerts
- **Endpoint**: `GET /api/alerts`
- **Query Parameters**:
  - `tab` (`all` | `unread` | `archived`)
  - `severity` (`all` | `critical` | `needs-attention` | `awareness`)
- **Response `200 OK`**

### 7.2 Mark Alert as Read
- **Endpoint**: `PUT /api/alerts/{id}/read`
- **Response `200 OK`**

### 7.3 Mark All Alerts Read
- **Endpoint**: `PUT /api/alerts/read-all`
- **Response `200 OK`**

### 7.4 Snooze Alert
- **Endpoint**: `PUT /api/alerts/{id}/snooze`
- **Request Body**: `{ "hours": 24 }`
- **Response `200 OK`**

### 7.5 Archive Alert
- **Endpoint**: `PUT /api/alerts/{id}/archive`
- **Response `200 OK`**

### 7.6 Add Alert Rule
- **Endpoint**: `POST /api/alerts/rules`
- **Request Body**:
```json
{
  "name": "Workload > 125%",
  "threshold": 125,
  "severity": "critical"
}
```
- **Response `201 Created`**

### 7.7 List Alert Rules
- **Endpoint**: `GET /api/alerts/rules`
- **Response `200 OK`**: Array of rules with `id`, `name`, `threshold`, `severity` and `active`.

---

## 8. Projects (`/api/projects`)

### 8.1 List Projects
- **Endpoint**: `GET /api/projects`
- **Query Parameters**:
  - `search` (string)
  - `status` (`all` | `attention` | `risk` | `track`)
  - `lead` (string)
- **Response `200 OK`**: List of projects (Atlas redesign, Beacon launch, Core platform).

### 8.2 Create Project
- **Endpoint**: `POST /api/projects`
- **Request Body**:
```json
{
  "name": "Design Systems V2",
  "subtitle": "Accessible foundations across all products",
  "lead": "Mei Tan",
  "weeklyCapacity": 80,
  "projectDueDate": "15 Dec 2026"
}
```
- **Response `201 Created`**

### 8.3 Project Detail and Updates
- **Get**: `GET /api/projects/{id}` returns a project.
- **Update**: `PUT /api/projects/{id}` accepts partial fields matching the create request and returns the updated project.
- **Delete**: `DELETE /api/projects/{id}` returns `{ "success": true, "id": "..." }`. Projects with assigned tasks cannot be deleted (`400 Bad Request`).

---

## 9. Reports & Analytics (`/api/reports`)

### 9.1 Get Analytics Report
- **Endpoint**: `GET /api/reports`
- **Query Parameters**:
  - `team` (`design-team` | `all`)
  - `range` (`last-8-weeks` | `last-4-weeks` | `last-12-weeks`)
  - `project` (`all` | specific project id)
- **Response `200 OK`**: Returns demand chart series, risk trend chart series, KPIs, and project pressure table.

### 9.2 Export CSV
- **Endpoint**: `GET /api/reports/export-csv`
- **Response `200 OK`**: `Content-Type: text/csv`

---

## 10. Workspace Settings (`/api/settings`)

### 10.1 Get Workspace Settings
- **Endpoint**: `GET /api/settings`
- **Response `200 OK`**: Working hours, threshold configuration, member list, and notification preferences.

### 10.2 Update Settings
- **Endpoint**: `PUT /api/settings`
- **Request Body**: Complete or partial settings JSON.
- **Response `200 OK`**

### 10.3 Invite Workspace Member
- **Endpoint**: `POST /api/settings/members`
- **Request Body**:
```json
{
  "name": "Jordan Lee",
  "email": "jordan.lee@forma.studio",
  "role": "Contributor"
}
```
- **Response `201 Created`**

## 11. Tasks and Teams

### 11.1 Tasks
- `GET /api/tasks?page=0&size=20&search=&status=&employeeId=` lists matching tasks in the standard pagination envelope.
- `POST /api/tasks` creates a task. Required fields: `title`; optional fields: `id`, `projectId`, `project`, `assigneeId`, `hours`, `due`, `status`. Returns `201 Created`.
- `PUT /api/tasks/{id}` updates supported task fields and rebalances assigned hours. Returns `200 OK`.
- `DELETE /api/tasks/{id}` deletes a task and releases its assigned hours. Returns `200 OK`.

### 11.2 Teams
- `GET /api/teams?page=0&size=20` lists teams in the standard pagination envelope.
