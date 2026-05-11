# Data Center Asset Management System (DCIM)

A full-stack Data Center Infrastructure Management system for tracking physical assets across sites, rooms, and racks — built for NOC engineers.

## Run & Operate

- Spring Boot backend: starts automatically via `mvn -f /home/runner/workspace/backend/pom.xml spring-boot:run`
- React frontend: starts automatically via `pnpm --filter @workspace/dcim-frontend run dev`
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks/Zod schemas from OpenAPI spec
- Required env: `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` — Postgres credentials

## Stack

- **Backend**: Java 17 (GraalVM), Spring Boot 3.2, Spring Data JPA, Spring Security (HTTP Basic)
- **Database**: PostgreSQL + Hibernate (DDL auto-update)
- **Frontend**: React + Vite + Tailwind CSS (dark NOC theme)
- **API Layer**: OpenAPI spec → Orval codegen → TanStack React Query hooks
- **Build**: Maven (backend), pnpm workspaces (frontend/codegen)

## Where things live

- `backend/src/main/java/com/dcim/` — Spring Boot application
  - `entity/` — JPA entities: Site, Room, Rack, Asset, AppUser
  - `repository/` — Spring Data JPA repositories
  - `service/` — Business logic layer
  - `controller/` — REST controllers
  - `security/` — Spring Security config + UserDetailsService
  - `config/` — DataSourceConfig (converts Replit DB URL), DataInitializer (seed data)
  - `dto/` — Request/response DTOs
  - `exception/` — Global exception handler
- `backend/src/main/resources/application.properties` — App configuration
- `lib/api-spec/openapi.yaml` — Single source of truth for API contract
- `artifacts/dcim-frontend/src/` — React frontend pages and components

## Architecture decisions

- Spring Boot backend runs as the api-server artifact on port 8080 at `/api`
- Replit's DATABASE_URL uses `postgresql://` scheme — DataSourceConfig converts it to `jdbc:postgresql://host:port/db` using PG* env vars
- OpenAPI spec drives both Zod server validation (via Orval) and React Query client hooks
- HTTP Basic auth (stateless sessions) — admin/admin123 (ADMIN role), noc/noc123 (USER role)
- Frontend hard-codes Basic auth header via custom-fetch.ts for the NOC dashboard use case

## Product

- **Dashboard**: KPI cards (sites, racks, assets, warranty alerts), rack utilization chart, asset type breakdown
- **Sites & Rooms**: Hierarchical navigation through Sites → Rooms → Racks
- **Rack View**: Visual 42U rack elevation diagram colored by asset type
- **Assets**: Full CRUD with type badges, status indicators, serial/tag tracking
- **Warranty Alerts**: Assets with warranties expiring within 90 days

## User preferences

- Java 17 + Spring Boot (Maven) for backend
- PostgreSQL for persistence
- React + Tailwind CSS dark theme for NOC-style frontend
- Docker + Jenkins planned for CI/CD flow

## Gotchas

- Always convert DATABASE_URL from `postgresql://` to `jdbc:postgresql://` — DataSourceConfig handles this using PG* env vars
- Maven build takes ~20-30s on cold start (dependency download)
- Spring Security CORS is configured to allow all origins in dev mode
- The `spring.jpa.hibernate.ddl-auto=update` creates/migrates tables automatically on startup

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- DB schema managed by Hibernate DDL auto-update
