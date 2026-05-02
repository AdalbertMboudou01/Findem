# AI Flows

## 1. Chatbot Analysis Flow

- Trigger: `ChatAnswerService.analyzeChatAnswers(applicationId)`.
- Persona: `FindemAssist`.
- Inputs:
  - candidate chatbot answers;
  - job context;
  - semantic facts when LLM extraction is enabled.
- Outputs:
  - `ChatAnswerAnalysisDTO`;
  - semantic cache on `Application`;
  - one internal AI comment with the initial analysis.
- Guardrail:
  - `AIFindAssistService` skips if `FindemAssist` already posted on the application.

## 2. Human Comment Review Flow

- Trigger: `CommentService.createComment(...)` after a human comment is saved.
- Persona: `FindemLooker`.
- Inputs:
  - latest human comment;
  - recent human comments;
  - chatbot analysis.
- Outputs:
  - optional internal AI comment for contradictions or missing critical angles;
  - optional internal AI comment for potential bias.
- Guardrails:
  - skipped when AI is disabled or API key is missing;
  - skipped when recent AI comments already exist;
  - bias alerts are rate-limited by recent alert detection.

## 3. Final Decision Review Flow

- Trigger: `DecisionService.recordFinalDecision(...)`.
- Persona: `FindemAssist`.
- Inputs:
  - final status;
  - rationale;
  - chatbot analysis;
  - team decision inputs.
- Outputs:
  - `Decision.aiReview`;
  - internal AI comment with the decision review.
- Guardrail:
  - skipped when AI is disabled or API key is missing.

## 4. AI Task Execution Flow

- Trigger: `TaskService.createTask(...)` when `assigneeId` equals `AIPersona.FINDEM_WORKER_ID`.
- Persona: `FindemWorker`.
- Inputs:
  - task type;
  - task description;
  - candidate name;
  - job title;
  - chatbot analysis.
- Outputs:
  - `Task.aiResult`;
  - task status set to `DONE`;
  - internal AI comment with the generated content;
  - system timeline event `TASK_DONE`.
- Guardrails:
  - skipped when AI is disabled or API key is missing;
  - unknown task types are ignored and logged.

## Shared Infrastructure

- `AIClientService`: centralizes OpenAI-compatible chat completion calls.
- `AIPersonaCommentService`: centralizes internal AI comment creation and system activity logging.
- `AIPersona`: keeps stable UUIDs for synthetic AI actors.
