# Findem Demo Frontend

Static demonstration frontend for the backend-only Findem API.

## Run Locally

```bash
cd assistant/frontend
python3 -m http.server 3100
```

Open:

```text
http://localhost:3100
```

## Run With Docker Compose

```bash
cd assistant
docker compose up -d --build
```

Open:

```text
http://localhost:3100
```

## Backend

The UI defaults to:

```text
http://localhost:8100
```

This matches the backend service exposed by `docker-compose.yml`.
