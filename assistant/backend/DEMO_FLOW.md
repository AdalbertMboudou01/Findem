# API Demo Flow

This flow demonstrates the backend without a frontend. It is designed for Swagger, Postman, Insomnia, or plain `curl`.

Base URLs:

- From the host machine: `http://localhost:8100`
- From inside the backend container: `http://localhost:8000`

Swagger:

- `http://localhost:8100/swagger-ui/index.html`
- `http://localhost:8100/v3/api-docs`

If host access is unavailable in the execution environment, verify Swagger from inside the container:

```bash
cd assistant
docker compose exec -T backend wget -qO- http://localhost:8000/v3/api-docs
```

## 0. Prerequisites

Start the stack:

```bash
cd assistant
docker compose up -d --build
```

For AI personas to call an OpenAI-compatible API, configure:

```text
APP_AI_ENABLED=true
APP_AI_API_KEY=...
APP_AI_MODEL=gpt-4o-mini
```

Without those values, AI persona flows remain safe and return no generated AI content.

## 1. Register a Company Owner

```bash
curl -s -X POST "$BASE/api/auth/register-company-owner" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ada Lovelace",
    "email": "ada.demo@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "companyName": "Findem Demo",
    "sector": "Software",
    "size": "1-10",
    "website": "https://example.com",
    "plan": "demo"
  }'
```

Capture from the response:

- `token`
- `companyId`
- `recruiterId`

Set:

```bash
export BASE=http://localhost:8100
export TOKEN=...
export COMPANY_ID=...
export RECRUITER_ID=...
```

## 2. Create a Job

```bash
curl -s -X POST "$BASE/api/jobs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Alternant developpeur Java\",
    \"description\": \"Backend Spring Boot, PostgreSQL, API REST.\",
    \"location\": \"Paris hybride\",
    \"alternanceRhythm\": \"3 jours entreprise / 2 jours ecole\",
    \"blockingCriteria\": {\"mustHave\": [\"Java\", \"Spring\"]},
    \"slug\": \"alternant-java-demo\",
    \"companyId\": \"$COMPANY_ID\",
    \"ownerRecruiterId\": \"$RECRUITER_ID\"
  }"
```

Capture:

```bash
export JOB_ID=...
```

## 3. Candidate Applies

This public endpoint creates a candidate and an application:

```bash
curl -s -X POST "$BASE/api/apply" \
  -H "Content-Type: application/json" \
  -d "{
    \"jobId\": \"$JOB_ID\",
    \"firstName\": \"Grace\",
    \"lastName\": \"Hopper\",
    \"email\": \"grace.demo@example.com\",
    \"phone\": \"+33123456789\",
    \"school\": \"Demo School\",
    \"githubUrl\": \"https://github.com/demo\",
    \"portfolioUrl\": \"https://example.com/portfolio\",
    \"consent\": true
  }"
```

Capture:

```bash
export CANDIDATE_ID=...
export APPLICATION_ID=...
```

## 4. Submit Chatbot Answers

```bash
curl -s -X POST "$BASE/api/chat-answers/submit-batch" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "[
    {
      \"applicationId\": \"$APPLICATION_ID\",
      \"candidateId\": \"$CANDIDATE_ID\",
      \"questionKey\": \"motivation\",
      \"questionText\": \"Pourquoi ce poste vous motive ?\",
      \"answer\": \"Je veux progresser sur Java et Spring Boot dans une equipe produit exigeante.\",
      \"required\": true
    },
    {
      \"applicationId\": \"$APPLICATION_ID\",
      \"candidateId\": \"$CANDIDATE_ID\",
      \"questionKey\": \"technical_skills\",
      \"questionText\": \"Quelles competences techniques avez-vous ?\",
      \"answer\": \"Java, Spring Boot, SQL, PostgreSQL, Docker, API REST.\",
      \"required\": true
    },
    {
      \"applicationId\": \"$APPLICATION_ID\",
      \"candidateId\": \"$CANDIDATE_ID\",
      \"questionKey\": \"projects\",
      \"questionText\": \"Decrivez un projet pertinent.\",
      \"answer\": \"J'ai construit une API de gestion de candidatures avec authentification JWT et PostgreSQL.\",
      \"required\": true
    },
    {
      \"applicationId\": \"$APPLICATION_ID\",
      \"candidateId\": \"$CANDIDATE_ID\",
      \"questionKey\": \"availability\",
      \"questionText\": \"Quelle est votre disponibilite ?\",
      \"answer\": \"Disponible immediatement, rythme 3 jours entreprise et 2 jours ecole.\",
      \"required\": true
    }
  ]"
```

## 5. Trigger FindemAssist Initial Analysis

```bash
curl -s -X GET "$BASE/api/chat-answers/analyze/$APPLICATION_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Expected behavior:

- returns `ChatAnswerAnalysisDTO`;
- caches semantic analysis on the application;
- posts one internal `FindemAssist - Analyse initiale` comment.

Check comments:

```bash
curl -s -X GET "$BASE/api/applications/$APPLICATION_ID/comments" \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Trigger FindemLooker With a Human Comment

```bash
curl -s -X POST "$BASE/api/applications/$APPLICATION_ID/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "Profil interessant, mais je veux confirmer la profondeur technique sur Spring Boot.",
    "visibility": "INTERNAL",
    "mentions": []
  }'
```

Expected behavior when AI is enabled:

- `FindemLooker` may post a contradiction, missing angle, or bias alert if it detects a useful signal;
- if nothing useful is detected, it returns `SKIP` and posts nothing.

## 7. Trigger FindemWorker With an AI Task

FindemWorker ID:

```text
00000000-0000-0000-0000-000000000003
```

```bash
curl -s -X POST "$BASE/api/applications/$APPLICATION_ID/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Generer un resume profil",
    "description": "Resume court pour preparation entretien.",
    "assigneeId": "00000000-0000-0000-0000-000000000003",
    "priority": "MEDIUM",
    "taskType": "PROFILE_SUMMARY"
  }'
```

Expected behavior when AI is enabled:

- task receives `aiResult`;
- task status becomes `DONE`;
- `FindemWorker` posts an internal comment with the generated content.

Check tasks:

```bash
curl -s -X GET "$BASE/api/applications/$APPLICATION_ID/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

## 8. Record Team Input and Final Decision

```bash
curl -s -X POST "$BASE/api/applications/$APPLICATION_ID/decision-inputs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sentiment": "FAVORABLE",
    "comment": "Bonne base technique, motivation claire.",
    "confidence": 4
  }'
```

```bash
curl -s -X POST "$BASE/api/applications/$APPLICATION_ID/decision" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "finalStatus": "INTERVIEW",
    "rationale": "Profil coherent avec les attentes, entretien technique a planifier."
  }'
```

Expected behavior when AI is enabled:

- `Decision.aiReview` is filled;
- `FindemAssist` posts a decision review comment.

## 9. Review Timeline

```bash
curl -s -X GET "$BASE/api/applications/$APPLICATION_ID/activity" \
  -H "Authorization: Bearer $TOKEN"
```

This should show human and system events, including AI persona activity.
