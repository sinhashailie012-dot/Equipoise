# Equipoise

Employee Workload and Burnout Prevention Dashboard.

## Project Structure

- `backend/`: Spring Boot 4 (Java 25) REST API backend with Spring Security, JWT, Spring Data JPA, and Actuator.
- `frontend/`: React 19, TypeScript, Vite, and Tailwind CSS dashboard interface.
- `docker-compose.yml`: Multi-container setup for PostgreSQL 17, Backend, and Frontend.
- `.github/workflows/`: CI (build & test) and CD (image publishing to GHCR) pipelines.

---

## Environments & Database Modes

### 1. Development Mode (`dev` profile - default)
- Uses an embedded **file-based H2 database** stored at `./backend/data/equipoise`.
- Data persists across server restarts in the local `data/` directory.
- H2 Web Console is available at `http://localhost:8080/h2-console`.
- Seeding via `DataInitializer` triggers automatically on first run only when the database is empty (`users.count() == 0`).

To run locally in dev mode:
```bash
cd backend
mvn spring-boot:run
```

### 2. Production Mode (`prod` profile)
- Connects to a **PostgreSQL** database (version 17+ recommended).
- Configured via environment variables:
  - `SPRING_DATASOURCE_URL`: JDBC connection URL (default: `jdbc:postgresql://postgres:5432/equipoisedb`).
  - `SPRING_DATASOURCE_USERNAME`: Database user (default: `equipoise`).
  - `SPRING_DATASOURCE_PASSWORD`: Database password.
  - `JWT_SECRET`: Secret key for JWT signing.

To run backend locally with `prod` profile against a local Postgres instance:
```bash
cd backend
SPRING_PROFILES_ACTIVE=prod \
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/equipoisedb \
SPRING_DATASOURCE_USERNAME=equipoise \
SPRING_DATASOURCE_PASSWORD=your_password \
JWT_SECRET=your_secure_jwt_secret \
mvn spring-boot:run
```

---

## Running with Docker Compose

A pre-configured `docker-compose.yml` runs PostgreSQL 17, the Spring Boot backend (`prod` profile), and the React frontend:

```bash
# 1. Copy the example environment file if you wish to customize credentials:
cp .env.example .env

# 2. Build and start all services:
docker compose up --build -d

# 3. Check logs:
docker compose logs -f backend
```

### Services & Ports:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080/api`
- **Actuator Health Endpoint**: `http://localhost:8080/actuator/health`
- **PostgreSQL**: `localhost:5432` with volume `postgres_data`

### Healthchecks:
- **Postgres**: Validated with `pg_isready -U <user> -d <db>`.
- **Backend**: Validated with `/actuator/health` probe before dependent services interact.

---

## Testing & Verification

Run backend unit and integration tests:
```bash
cd backend
mvn -B clean verify
```

Run frontend build:
```bash
cd frontend
npm ci
npm run build
```

---

## Notifications (Slack & Email)

Equipoise includes notifications for critical workload and burnout alerts, plus a weekly digest:
- **Slack**: Configured via `SLACK_WEBHOOK_URL` (Incoming Webhook).
- **Email**: Configured via Spring Mail (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `MAIL_FROM`).
- **Graceful Fallback**: If keys/hosts are not configured, the application runs normally and outputs notification logs without failing.
- **Privacy Assurance**: Notifications only include the affected person's name and the alert title/status. Sensitive personal information, notes, and medical details are never dispatched.
- **Settings**: Channels and triggering severities can be managed under **Settings > Notifications**, where a "Send test notification" button is also provided.

---

## Integrations (Jira Cloud & Calendar Feeds)

Equipoise connects to external work trackers and calendars behind interchangeable adapters:
- **Jira Cloud (`TaskSource`)**: Connects via Jira REST API using `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and configurable `JIRA_JQL`. Matches assignees to team members by email address and imports estimated hours.
- **Calendar Feeds (`LeaveSource`)**: Connects to Google Calendar or corporate iCal feeds via `ICAL_FEED_URL` to turn out-of-office events into Leave records.
- **Demo Mode & Mock Fallbacks**: When environment variables are absent, `MockTaskSource` and `MockLeaveSource` run automatically, displaying a **Demo mode** status tag in the dashboard.
- **Idempotent Synchronization**: Imports match records on `externalId`, updating existing entities upon subsequent syncs rather than producing duplicate tasks or leaves.
- **Manual Sync**: Managers can trigger synchronization on demand via the **Sync now** button under **Settings > Integrations**.
