# Interface Decision

## Current State

The frontend has been intentionally removed. The backend is now the stable demonstrable surface.

Available interfaces:

- Swagger/OpenAPI for exploration;
- Postman/Insomnia for scripted demos;
- `curl` flow documented in `DEMO_FLOW.md`.

## Recommendation

For the next demo and the memoire defense, use an API-first demo rather than rebuilding a frontend immediately.

Reasons:

- the backend now starts in Docker;
- the AI persona flows are backend workflows;
- Swagger exposes the available API surface;
- a scripted API demo is faster to stabilize and easier to explain technically.

## When to Rebuild a Frontend

Rebuild a minimal frontend only after the API demo is stable.

The minimal useful frontend would need only:

- login/onboarding;
- job creation;
- application detail view;
- chatbot answers view;
- comments and AI persona comments;
- tasks with FindemWorker assignment;
- decision panel with `aiReview`.

Avoid rebuilding dashboards, team chat, announcements, or broad admin pages until the core flow is demonstrated.

## Suggested Demo Surface

Use:

- Swagger: `http://localhost:8100/swagger-ui/index.html`
- API docs: `http://localhost:8100/v3/api-docs`
- Demo script: `DEMO_FLOW.md`

If host networking is unavailable in the execution environment, test from inside the container:

```bash
docker compose exec -T backend wget -qO- http://localhost:8000/v3/api-docs
```
