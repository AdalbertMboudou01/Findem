# Interface Decision

## Current State

The backend remains the stable demonstrable surface, and a lightweight static frontend now exists for the core demo flow.

Available interfaces:

- Demo frontend: `http://localhost:3100`;
- Swagger/OpenAPI for exploration;
- Postman/Insomnia for scripted demos;
- `curl` flow documented in `DEMO_FLOW.md`.

## Recommendation

For the next demo and the memoire defense, use the static frontend as the primary walkthrough and keep Swagger/Postman as a fallback.

Reasons:

- the backend now starts in Docker;
- the AI persona flows are backend workflows;
- Swagger exposes the available API surface;
- the static frontend follows the same API demo path without adding a build pipeline.

## When to Rebuild a Frontend

Replace the static frontend with a full application only after the demo story is stable.

The current minimal useful frontend covers:

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

- Demo frontend: `http://localhost:3100`
- Swagger: `http://localhost:8100/swagger-ui/index.html`
- API docs: `http://localhost:8100/v3/api-docs`
- Demo script: `DEMO_FLOW.md`

If host networking is unavailable in the execution environment, test from inside the container:

```bash
docker compose exec -T backend wget -qO- http://localhost:8000/v3/api-docs
```
