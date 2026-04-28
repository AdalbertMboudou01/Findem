export type TriCategory = 'prioritaire' | 'a_examiner' | 'a_revoir' | 'a_ecarter';

export type CandidateStatus =
  | 'retenu_entretien'
  | 'a_revoir_manuellement'
  | 'non_retenu'
  | 'vivier'
  | 'en_attente';

export type OfferStatus = 'ouvert' | 'cloture';

export type OfferExigence = 'standard' | 'selectif' | 'tres_selectif' | 'excellence';

export interface OfferSettings {
  offer_id: string;
  max_candidatures: number | null;
  auto_close: boolean;
  exigence: OfferExigence;
  stack_attendue: string[];
  importance_github: 'faible' | 'normale' | 'forte';
  types_projets_valorises: string;
  top_n_visible: number;
}

export interface Offer {
  id: string;
  title: string;
  context: string;
  missions: string;
  service: string;
  location: string;
  rythme: string;
  technologies: string[];
  status: OfferStatus;
  chatbot_url: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface AnalysisFact {
  dimension: string;
  finding: string;
  evidence: string;
  confidence: number;
  source_question: string;
}

export type AnalysisFactFeedbackDecision = 'CONFIRMED' | 'CORRECTED' | 'REJECTED';

export interface AnalysisFactFeedback {
  feedback_id: string;
  application_id: string;
  dimension: string;
  finding: string;
  evidence: string;
  decision: AnalysisFactFeedbackDecision;
  corrected_finding: string;
  reviewer_comment: string;
  created_at: string;
}

export interface ApplicationComment {
  id: string;
  application_id: string;
  company_id: string;
  author_user_id: string | null;
  author_recruiter_id: string | null;
  author_name: string;
  author_email: string | null;
  content: string;
  created_at: string;
  updated_at: string | null;
}

export type ApplicationEventType =
  | 'COMMENT_ADDED'
  | 'STATUS_CHANGED'
  | 'TASK_CREATED'
  | 'TASK_DONE'
  | 'INTERVIEW_SCHEDULED'
  | 'DOCUMENT_ADDED'
  | 'DECISION_RECORDED'
  | 'MENTION_TRIGGERED'
  | 'CHATBOT_COMPLETED'
  | 'AI_ANALYSIS_DONE';

export interface ApplicationActivity {
  id: string;
  application_id: string;
  company_id: string;
  actor_id: string | null;
  actor_type: 'USER' | 'RECRUITER' | 'SYSTEM';
  event_type: ApplicationEventType;
  payload: Record<string, unknown>;
  visibility: 'ALL' | 'INTERNAL';
  created_at: string;
}

export interface InAppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  reference_type: string;
  reference_id: string | null;
  created_at: string;
}

export interface Candidate {
  id: string;
  application_id: string | null;
  application_created_at: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  cv_url: string | null;
  cv_content_type: string | null;
  cv_file_name: string | null;
  tri_category: TriCategory;
  status: CandidateStatus;
  alternance_compatible: boolean;
  disponibilite: string;
  rythme_alternance: string;
  motivation_summary: string;
  motivation_assessment: string;
  projet_cite: string;
  projet_assessment: string;
  technologies: string[];
  github_url: string | null;
  portfolio_url: string | null;
  github_assessment: string;
  location_assessment: string;
  points_forts: string[];
  points_attention: string[];
  follow_up_questions: string[];
  action_recommandee: string;
  ai_recommended_action: string | null;
  ai_recommended_status: CandidateStatus | null;
  analysis_schema_version: string | null;
  analysis_fallback_used: boolean;
  analysis_facts: AnalysisFact[];
  review_total_facts: number;
  review_reviewed_facts: number;
  review_completion_rate: number;
  chatbot_responses: ChatbotResponse[] | null;
  chatbot_completed: boolean;
  offer_id: string | null;
  user_id: string | null;
  created_at: string;
}

export interface ChatbotResponse {
  question: string;
  answer: string;
}

export interface ChatbotConfig {
  id: string;
  offer_id: string;
  questions: ChatbotQuestion[];
  welcome_message: string;
  closing_message: string;
  active: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatbotQuestion {
  id: string;
  text: string;
  type: 'open' | 'choice' | 'url' | 'boolean' | 'file';
  required: boolean;
  options?: string[];
  order: number;
}

export interface Interview {
  id: string;
  candidate_id: string;
  offer_id: string;
  scheduled_at: string | null;
  duration_minutes: number;
  location: string;
  notes: string;
  status: 'planifie' | 'confirme' | 'termine' | 'annule';
  user_id: string | null;
  created_at: string;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  service: string;
  offer_id: string | null;
  candidate_id: string | null;
  user_id: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'important' | 'urgent';
  user_id: string | null;
  created_at: string;
}
