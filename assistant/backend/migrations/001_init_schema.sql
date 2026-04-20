-- Schéma de base PostgreSQL pour l’assistant de préqualification
-- UUID par défaut pour toutes les clés primaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE companies (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sector TEXT,
    size TEXT,
    website TEXT,
    plan TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    config JSONB
);

CREATE TABLE recruiters (
    recruiter_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT,
    status TEXT,
    auth_user_id UUID,
    UNIQUE(company_id, email)
);

CREATE TABLE jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
    owner_recruiter_id UUID REFERENCES recruiters(recruiter_id),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    alternance_rhythm TEXT,
    blocking_criteria JSONB,
    technologies TEXT[],
    slug TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE candidates (
    candidate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    school TEXT,
    consent BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE application_statuses (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL
);

CREATE TABLE applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(candidate_id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(job_id) ON DELETE CASCADE,
    status_id UUID REFERENCES application_statuses(status_id),
    source_channel TEXT,
    applied_at TIMESTAMP DEFAULT NOW(),
    priority_level INT,
    alternance_compatibility BOOLEAN,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(candidate_id, job_id)
);

CREATE TABLE chat_sessions (
    chat_session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    scenario TEXT,
    language TEXT,
    progress INT,
    completion_score INT,
    abandoned BOOLEAN
);

CREATE TABLE chat_questions (
    question_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    answer_type TEXT,
    "order" INT,
    required BOOLEAN,
    category TEXT,
    scenario_version TEXT
);

CREATE TABLE chat_answers (
    chat_answer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_session_id UUID REFERENCES chat_sessions(chat_session_id) ON DELETE CASCADE,
    question_id UUID REFERENCES chat_questions(question_id),
    answer_text TEXT,
    normalized_value TEXT,
    answered_at TIMESTAMP DEFAULT NOW(),
    required BOOLEAN
);

CREATE TABLE candidate_links (
    candidate_link_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    link_type TEXT,
    url TEXT,
    provided_manually BOOLEAN,
    validated BOOLEAN,
    collected_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
    project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    candidate_link_id UUID REFERENCES candidate_links(candidate_link_id),
    name TEXT,
    source_type TEXT,
    url TEXT,
    technologies TEXT[],
    has_readme BOOLEAN,
    deployment_signals JSONB,
    last_activity TIMESTAMP,
    summary TEXT
);

CREATE TABLE application_summaries (
    summary_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    motivation TEXT,
    projects TEXT,
    technical_signals TEXT,
    attention_points TEXT,
    initial_category TEXT,
    recommended_action TEXT,
    author TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE talent_pools (
    talent_pool_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
    name TEXT,
    owner_recruiter_id UUID REFERENCES recruiters(recruiter_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE talent_pool_entries (
    pool_entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    talent_pool_id UUID REFERENCES talent_pools(talent_pool_id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    reason TEXT,
    added_at TIMESTAMP DEFAULT NOW(),
    active BOOLEAN,
    note TEXT
);

CREATE TABLE interviews (
    interview_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    interview_type TEXT,
    scheduled_at TIMESTAMP,
    recruiter_id UUID REFERENCES recruiters(recruiter_id),
    calendly_link TEXT,
    status TEXT
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(application_id) ON DELETE CASCADE,
    recipient_type TEXT,
    recipient_id UUID,
    message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    notification_type TEXT
);

-- Indexes recommandés
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status_id ON applications(status_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_created_at ON applications(applied_at);
CREATE INDEX idx_applications_source_channel ON applications(source_channel);
