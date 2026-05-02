# Schema Validation

## Goal

The backend should be able to start with Hibernate schema validation enabled. This proves that the live PostgreSQL schema matches the current JPA entities.

## Normal Docker Startup

First boot or local development:

```bash
cd assistant
docker compose up -d --build
```

This uses `SPRING_JPA_HIBERNATE_DDL_AUTO=update` from `docker-compose.yml`, so Hibernate can create or adjust the local schema.

## Validation Startup

After the schema exists, validate it with:

```bash
cd assistant
docker compose -f docker-compose.yml -f docker-compose.validate.yml up -d --build backend
docker compose logs --tail=120 backend
```

Expected signal:

```text
Started AssistantPrequalificationBackendApplication
```

If validation fails, Spring Boot stops during startup and the logs usually mention the missing table, missing column, or incompatible type.

## One-Off Validation Container

You can also run a temporary backend without touching the running service:

```bash
cd assistant
docker run --rm --network assistant_default --env-file .env \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/assistant_db \
  -e SPRING_JPA_HIBERNATE_DDL_AUTO=validate \
  -p 8199:8000 assistant-backend:latest
```

Use `Ctrl+C` after the startup message appears.

## Current Result

The current Docker PostgreSQL database was validated successfully with `ddl-auto=validate`.
