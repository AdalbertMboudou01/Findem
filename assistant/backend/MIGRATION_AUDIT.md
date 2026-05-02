# Migration Audit

## AI Persona Migrations

The AI persona fields are covered by the current migrations:

- `016_add_ai_review_to_decisions.sql`
  - Adds `decisions.ai_review`.
  - Matches `Decision.aiReview`.

- `017_update_author_type_constraint.sql`
  - Allows `AI_SYSTEM` in `comments.author_type`.
  - Matches `Comment.AuthorType.AI_SYSTEM`.

- `018_add_ai_task_fields.sql`
  - Adds `tasks.task_type`.
  - Adds `tasks.ai_result`.
  - Matches `Task.taskType` and `Task.aiResult`.

## Residual Schema Risk

The older migration set appears to mix two naming conventions:

- some foreign keys reference `companies(id)`;
- newer migrations and Java entities expect `companies(company_id)`;
- the Java entity `Company.companyId` maps to `company_id` under Spring's default physical naming.

This is broader than the AI persona work. Before a production deployment with
`spring.jpa.hibernate.ddl-auto=validate`, run schema validation against a fresh database and decide whether to:

- normalize the original migrations before first deployment; or
- add corrective migrations for an already deployed database.
