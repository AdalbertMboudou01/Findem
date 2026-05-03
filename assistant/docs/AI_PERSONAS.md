# AI Personas

This backend uses stable synthetic actor IDs for AI-generated actions. AI personas are represented as
`Comment.AuthorType.AI_SYSTEM` comments and system timeline events.

## FindemAssist

- ID: `00000000-0000-0000-0000-000000000001`
- Class constant: `AIPersona.FINDEM_ASSIST_ID`
- Purpose: candidate prequalification assistance.
- Triggers:
  - after chatbot answer analysis, posts the initial analysis once per application;
  - after final decision recording, reviews decision consistency.
- Main outputs:
  - internal comment: `FindemAssist - Analyse initiale`;
  - internal comment: `FindemAssist - Relecture de decision`;
  - `Decision.aiReview` for the final decision review.

## FindemLooker

- ID: `00000000-0000-0000-0000-000000000002`
- Class constant: `AIPersona.FINDEM_LOOKER_ID`
- Purpose: review collaboration quality.
- Trigger:
  - after a human comment is created.
- Main outputs:
  - internal comment when a contradiction or missing critical angle is detected;
  - internal comment when a potential recruitment bias is detected.
- Guardrails:
  - skips when AI is disabled or API key is missing;
  - avoids posting when recent AI comments are already present.

## FindemWorker

- ID: `00000000-0000-0000-0000-000000000003`
- Class constant: `AIPersona.FINDEM_WORKER_ID`
- Purpose: execute explicit recruiter-assigned AI tasks.
- Trigger:
  - task creation where `assigneeId` is `AIPersona.FINDEM_WORKER_ID`.
- Supported task types:
  - `EMAIL_CONFIRMATION`
  - `EMAIL_REJECTION`
  - `EMAIL_INVITATION`
  - `INTERVIEW_QUESTIONS`
  - `PROFILE_SUMMARY`
- Main outputs:
  - `Task.aiResult`;
  - task status set to `DONE`;
  - internal comment containing the generated result.

## Runtime Switches

AI persona services are enabled by:

- `app.ai.enabled`
- `app.ai.api-key`
- `app.ai.base-url`
- `app.ai.model`

Legacy semantic extractor names still work as fallback:

- `app.semantic-extractor.enabled`
- `app.semantic-extractor.api-key`
- `app.semantic-extractor.base-url`
- `app.semantic-extractor.model`
