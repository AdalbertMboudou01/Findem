export type TriCategory = 'prioritaire' | 'a_examiner' | 'a_revoir' | 'a_ecarter';

export type CandidateStatus =
  | 'retenu_entretien'
  | 'a_revoir_manuellement'
  | 'non_retenu'
  | 'vivier'
  | 'en_attente';

export type OfferStatus = 'ouvert' | 'pause' | 'cloture';

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
  projet_cite: string;
  technologies: string[];
  github_url: string | null;
  portfolio_url: string | null;
  points_attention: string[];
  action_recommandee: string;
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
