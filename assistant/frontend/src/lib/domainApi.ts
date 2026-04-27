import { deleteJson, getJson, postJson, putJson, patchJson } from './api';
import type { AnalysisFact, AnalysisFactFeedback, AnalysisFactFeedbackDecision, ApplicationActivity, ApplicationComment, Candidate, CandidateStatus, ChatbotQuestion, InAppNotification, Offer, OfferStatus, TriCategory } from '../types';

type BackendCandidate = {
  candidateId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  location?: string | null;
  school?: string | null;
  inPool?: boolean;
  githubUrl?: string | null;
  portfolioUrl?: string | null;
  cvPath?: string | null;
  cvContentType?: string | null;
  cvFileName?: string | null;
  createdAt?: string | null;
};

type BackendJob = {
  jobId: string;
  title?: string;
  description?: string;
  location?: string;
  alternanceRhythm?: string;
  technologies?: string[];
  contextePoste?: string;
  missionsDetaillees?: string;
  serviceEntreprise?: string;
  statut?: string;
  createdAt?: string | null;
  slug?: string | null;
  blockingCriteria?: Record<string, unknown> | null;
  company?: { companyId?: string };
  ownerRecruiter?: { recruiterId?: string };
};

type BackendApplication = {
  applicationId?: string;
  candidate?: { candidateId?: string };
  job?: { jobId?: string };
  status?: { statusId?: string; code?: string; label?: string };
  createdAt?: string | null;
};

type BackendChatAnswerSummary = {
  applicationId?: string;
  motivationLevel?: string;
  technicalLevel?: string;
  hasProjectDetails?: boolean;
  hasClearAvailability?: boolean;
  locationMatch?: string;
  completenessScore?: number;
  recommendedAction?: string;
  motivationSummary?: string;
  motivationAssessment?: string;
  projectAssessment?: string;
  githubSummary?: string;
  githubAssessment?: string;
  availabilityAssessment?: string;
  locationAssessment?: string;
  mentionedProjects?: string[];
  technicalSkills?: string[];
  strengths?: string[];
  missingInformation?: string[];
  inconsistencies?: string[];
  pointsToConfirm?: string[];
  recruiterGuidance?: string;
  analysisSchema?: {
    version?: string;
    facts?: Array<{
      dimension?: string;
      finding?: string;
      evidence?: string;
      confidence?: number;
      sourceQuestion?: string;
    }>;
    missingInformation?: string[];
    contradictions?: string[];
    fallbackUsed?: boolean;
  };
  analysisReviewCoverage?: {
    reviewedFacts?: number;
    totalFacts?: number;
    completionRate?: number;
  };
};

type BackendApplicationStatus = {
  statusId: string;
  code?: string;
  label?: string;
};

type BackendCompany = {
  companyId: string;
};

type BackendRecruiter = {
  recruiterId: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string;
  company?: { companyId?: string };
};

type BackendCompanyProfile = {
  companyId: string;
  name?: string;
  sector?: string;
  size?: string;
  website?: string;
  plan?: string;
};

type BackendInvitation = {
  invitationId?: string;
  companyId?: string;
  email?: string;
  role?: string;
  status?: string;
  expiresAt?: string;
  createdAt?: string;
  invitationToken?: string;
};

type BackendCompanyCreateRequest = {
  name: string;
  sector: string;
  size: string;
  website?: string;
  plan?: string;
};

type BackendRecruiterCreateRequest = {
  name: string;
  email: string;
  password: string;
  role: string;
};

type BackendBootstrapCompanyResponse = {
  created?: boolean;
  companyName?: string;
  email?: string;
  companyId?: string;
  ownerRecruiterId?: string;
};

type BackendChatbotQuestion = {
  id?: string;
  questionText?: string;
  orderIndex?: number;
  answerType?: ChatbotQuestion['type'];
  required?: boolean;
};

type BackendAnalysisFactFeedback = {
  feedbackId?: string;
  applicationId?: string;
  dimension?: string;
  finding?: string;
  evidence?: string;
  decision?: AnalysisFactFeedbackDecision;
  correctedFinding?: string;
  reviewerComment?: string;
  createdAt?: string;
};

type BackendApplicationComment = {
  id?: string;
  applicationId?: string;
  companyId?: string;
  authorUserId?: string;
  authorRecruiterId?: string;
  authorName?: string;
  authorEmail?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BackendApplicationActivity = {
  id?: string;
  applicationId?: string;
  companyId?: string;
  actorUserId?: string;
  actorRecruiterId?: string;
  eventType?: string;
  title?: string;
  description?: string;
  createdAt?: string;
};

type BackendInAppNotification = {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  read?: boolean;
  referenceType?: string;
  referenceId?: string;
  createdAt?: string;
};

type BackendInAppNotificationListResponse = {
  notifications?: BackendInAppNotification[];
  unreadCount?: number;
};

export type OfferDraftInput = {
  title: string;
  description: string;
  location: string;
  contractDuration: string;
};

function normalizeContractDuration(raw: string) {
  const value = (raw || '').trim().toLowerCase();
  if (!value) return null;

  if (value === '6' || value === '6m' || value === '6 mois' || value === '6 month' || value === '6 months') return '6 mois';
  if (value === '12' || value === '12m' || value === '12 mois' || value === '12 month' || value === '12 months') return '12 mois';
  if (value === '24' || value === '24m' || value === '24 mois' || value === '24 month' || value === '24 months') return '24 mois';
  if (value === '36' || value === '36m' || value === '36 mois' || value === '36 month' || value === '36 months') return '36 mois';
  return null;
}

export type CompanyProfile = {
  companyId: string;
  name: string;
  sector: string;
  size: string;
  website: string;
  plan: string;
};

export type CompanyInvitation = {
  invitationId: string;
  companyId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string | null;
  createdAt: string | null;
  invitationToken?: string | null;
};

export type CompanyRecruiterMember = {
  recruiterId: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

function normalizeOfferStatus(raw?: string): OfferStatus {
  const value = (raw || '').toLowerCase();
  if (value.includes('cloture') || value.includes('ferme')) return 'cloture';
  return 'ouvert';
}

function mapCandidateStatus(statusCode?: string, inPool?: boolean): CandidateStatus {
  const code = (statusCode || '').toLowerCase();
  if (inPool || code.includes('pool') || code.includes('vivier')) return 'vivier';
  if (code.includes('entretien') || code.includes('interview') || code.includes('retain')) return 'retenu_entretien';
  if (code.includes('reject') || code.includes('non_retenu') || code.includes('refus')) return 'non_retenu';
  if (code.includes('review') || code.includes('revoir')) return 'a_revoir_manuellement';
  return 'en_attente';
}

function mapTriCategory(status: CandidateStatus): TriCategory {
  if (status === 'retenu_entretien') return 'prioritaire';
  if (status === 'a_revoir_manuellement' || status === 'vivier') return 'a_revoir';
  if (status === 'non_retenu') return 'a_ecarter';
  return 'a_examiner';
}

function mapRecommendedActionLabel(action?: string, guidance?: string): string {
  if (guidance && guidance.trim().length > 0) return guidance;

  const value = (action || '').toUpperCase();
  if (value === 'MANUAL_REVIEW') return 'Decision finale humaine requise sur la base des constats et preuves extraites.';
  if (value === 'PRIORITY' || value === 'INTERVIEW') return 'Lecture prioritaire recommandee avant validation humaine.';
  if (value === 'REVIEW') return 'Lecture manuelle recommandee pour confirmer les points encore ambigus.';
  if (value === 'REJECT') return 'Des clarifications sont necessaires avant de pouvoir conclure sur cette candidature.';
  return 'Lecture complementaire recommandee.';
}

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapStatusToCode(status: CandidateStatus) {
  switch (status) {
    case 'retenu_entretien':
      return { code: 'retenu_entretien', label: 'Retenu entretien' };
    case 'a_revoir_manuellement':
      return { code: 'a_revoir_manuellement', label: 'A revoir manuellement' };
    case 'non_retenu':
      return { code: 'non_retenu', label: 'Non retenu' };
    case 'en_attente':
      return { code: 'en_attente', label: 'En attente' };
    case 'vivier':
      return { code: 'vivier', label: 'A revoir manuellement' };
    default:
      return { code: 'en_attente', label: 'En attente' };
  }
}

async function getOrCreateApplicationStatusId(status: CandidateStatus) {
  const statuses = await getJson<BackendApplicationStatus[]>('/api/application-statuses');
  const wanted = mapStatusToCode(status);
  const existing = statuses.find((item) => (item.code || '').toLowerCase() === wanted.code);
  if (existing?.statusId) return existing.statusId;

  const created = await postJson<BackendApplicationStatus>('/api/application-statuses', {
    code: wanted.code,
    label: wanted.label,
  });
  return created.statusId;
}

async function getJobOwnerIds() {
  try {
    const bootstrap = await postJson<BackendBootstrapCompanyResponse>('/api/companies/bootstrap-test', {});
    if (bootstrap?.companyId && bootstrap?.ownerRecruiterId) {
      return {
        companyId: bootstrap.companyId,
        ownerRecruiterId: bootstrap.ownerRecruiterId,
      };
    }
  } catch {
    // Fallback vers la logique existante si l'utilisateur n'est pas connecte.
  }

  let companies = await getJson<BackendCompany[]>('/api/companies');
  if (!companies.length) {
    const companyPayload: BackendCompanyCreateRequest = {
      name: 'Entreprise test',
      sector: 'Technologie',
      size: '1-10',
      website: 'https://exemple.local',
      plan: 'starter',
    };
    await postJson<BackendCompany>('/api/companies', companyPayload);
    companies = await getJson<BackendCompany[]>('/api/companies');
  }

  if (!companies.length) {
    throw new Error('Impossible de preparer une entreprise pour la creation d\'offre.');
  }

  let recruiters = await getJson<BackendRecruiter[]>('/api/recruiters');
  if (!recruiters.length) {
    const uniq = Date.now();
    const recruiterPayload: BackendRecruiterCreateRequest = {
      name: 'Recruteur test',
      email: `recruteur.test.${uniq}@exemple.local`,
      password: 'Test12345!',
      role: 'ADMIN',
    };
    await postJson<BackendRecruiter>('/api/recruiters', recruiterPayload);
    recruiters = await getJson<BackendRecruiter[]>('/api/recruiters');
  }

  if (!recruiters.length) {
    throw new Error('Impossible de preparer un recruteur pour la creation d\'offre.');
  }

  const firstCompanyId = companies[0].companyId;
  const recruiter = recruiters.find((item) => item.company?.companyId === firstCompanyId) || recruiters[0];

  return {
    companyId: firstCompanyId,
    ownerRecruiterId: recruiter.recruiterId,
  };
}

export async function bootstrapTestCompany() {
  const response = await postJson<BackendBootstrapCompanyResponse>('/api/companies/bootstrap-test', {});
  return {
    created: Boolean(response?.created),
    companyName: response?.companyName || null,
    email: response?.email || null,
    companyId: response?.companyId || null,
    ownerRecruiterId: response?.ownerRecruiterId || null,
  };
}

async function updatePoolMembership(candidateId: string, inPool: boolean) {
  if (inPool) {
    await postJson(`/api/candidates/${candidateId}/pool`, {});
    return;
  }

  try {
    await deleteJson(`/api/candidates/${candidateId}/pool`);
  } catch {
    // Ignore removal errors when candidate is already outside pool.
  }
}

export async function setOfferStatus(offerId: string, status: OfferStatus) {
  const job = await getJson<BackendJob>(`/api/jobs/${offerId}`);
  await putJson(`/api/jobs/${offerId}`, {
    ...job,
    statut: status,
  });
}

export async function upsertOffer(offerId: string | null, input: OfferDraftInput): Promise<string> {
  const description = input.description.trim();
  const location = input.location.trim();
  const normalizedDuration = normalizeContractDuration(input.contractDuration);

  if (input.contractDuration.trim().length > 0 && !normalizedDuration) {
    throw new Error('La duree du contrat doit etre: 6 mois, 12 mois, 24 mois ou 36 mois.');
  }

  if (offerId) {
    const current = await getJson<BackendJob>(`/api/jobs/${offerId}`);
    await putJson(`/api/jobs/${offerId}`, {
      ...current,
      title: input.title,
      description,
      location: location || current.location || 'Non renseigne',
      alternanceRhythm: normalizedDuration,
      technologies: current.technologies || [],
      contextePoste: description,
      missionsDetaillees: description,
      serviceEntreprise: current.serviceEntreprise || 'Non renseigne',
      statut: current.statut || 'ouvert',
      slug: current.slug || toSlug(input.title),
    });
    return offerId;
  }

  await assertCompanyProfileComplete();

  const ownerIds = await getJobOwnerIds();
  const created = await postJson<BackendJob>('/api/jobs', {
    title: input.title,
    description,
    location: location || 'Non renseigne',
    alternanceRhythm: normalizedDuration,
    blockingCriteria: {},
    slug: toSlug(input.title),
    companyId: ownerIds.companyId,
    ownerRecruiterId: ownerIds.ownerRecruiterId,
  });

  if (!created?.jobId) {
    throw new Error('Creation de l\'offre invalide: identifiant manquant.');
  }

  return created.jobId;
}

function mapCompanyProfile(raw: BackendCompanyProfile): CompanyProfile {
  return {
    companyId: raw.companyId,
    name: raw.name || '',
    sector: raw.sector || '',
    size: raw.size || '',
    website: raw.website || '',
    plan: raw.plan || 'starter',
  };
}

function isProfileComplete(profile: CompanyProfile | null) {
  if (!profile) return false;
  return Boolean(profile.name.trim() && profile.sector.trim() && profile.size.trim());
}

export async function loadCurrentCompanyProfile(): Promise<CompanyProfile | null> {
  const companies = await getJson<BackendCompanyProfile[]>('/api/companies');
  if (!companies || companies.length === 0) {
    return null;
  }
  return mapCompanyProfile(companies[0]);
}

export async function saveCurrentCompanyProfile(payload: {
  name: string;
  sector: string;
  size: string;
  website?: string;
  plan?: string;
}): Promise<CompanyProfile> {
  const existing = await loadCurrentCompanyProfile();
  if (!existing) {
    throw new Error('Aucune entreprise liee a votre compte.');
  }

  const saved = await putJson<BackendCompanyProfile>(`/api/companies/${existing.companyId}`, {
    companyId: existing.companyId,
    name: payload.name,
    sector: payload.sector,
    size: payload.size,
    website: payload.website || '',
    plan: payload.plan || existing.plan || 'starter',
    config: {},
  });

  return mapCompanyProfile(saved);
}

export async function assertCompanyProfileComplete(): Promise<void> {
  const profile = await loadCurrentCompanyProfile();
  if (!isProfileComplete(profile)) {
    throw new Error('Profil entreprise incomplet. Completez votre setup entreprise avant de creer une offre.');
  }
}

export async function loadCompanyMembers(): Promise<CompanyRecruiterMember[]> {
  const recruiters = await getJson<BackendRecruiter[]>('/api/recruiters');
  return (recruiters || []).map((r) => ({
    recruiterId: r.recruiterId,
    name: r.name || '',
    email: r.email || '',
    role: (r.role || 'RECRUITER').toUpperCase(),
    status: r.status || '',
  }));
}

export async function loadCompanyInvitations(): Promise<CompanyInvitation[]> {
  const invitations = await getJson<BackendInvitation[]>('/api/company-members/invitations');
  return (invitations || []).map((inv) => ({
    invitationId: inv.invitationId || '',
    companyId: inv.companyId || '',
    email: inv.email || '',
    role: (inv.role || 'RECRUITER').toUpperCase(),
    status: inv.status || '',
    expiresAt: inv.expiresAt || null,
    createdAt: inv.createdAt || null,
    invitationToken: inv.invitationToken || null,
  }));
}

export async function inviteRecruiter(payload: { email: string; role: 'RECRUITER' | 'ADMIN' }): Promise<CompanyInvitation> {
  const created = await postJson<BackendInvitation>('/api/company-members/invitations', payload);
  return {
    invitationId: created.invitationId || '',
    companyId: created.companyId || '',
    email: created.email || payload.email,
    role: (created.role || payload.role).toUpperCase(),
    status: created.status || 'PENDING',
    expiresAt: created.expiresAt || null,
    createdAt: created.createdAt || null,
    invitationToken: created.invitationToken || null,
  };
}

export async function setCandidateDecision(candidateId: string, status: CandidateStatus) {
  await updatePoolMembership(candidateId, status === 'vivier');
  if (status === 'vivier') return;

  const applications = await getJson<BackendApplication[]>('/api/applications');
  const application = applications.find((item) => item.candidate?.candidateId === candidateId);

  if (!application?.applicationId) {
    throw new Error('Aucune candidature reliee a ce candidat.');
  }

  const statusId = await getOrCreateApplicationStatusId(status);
  const fullApplication = await getJson<BackendApplication>(`/api/applications/${application.applicationId}`);

  await putJson(`/api/applications/${application.applicationId}`, {
    ...fullApplication,
    status: { statusId },
  });
}

export async function loadRecruitmentData(): Promise<{ offers: Offer[]; candidates: Candidate[] }> {
  const [jobs, backendCandidates, applications] = await Promise.all([
    getJson<BackendJob[]>('/api/jobs'),
    getJson<BackendCandidate[]>('/api/candidates'),
    getJson<BackendApplication[]>('/api/applications'),
  ]);

  const candidateToApplication = new Map<string, BackendApplication>();
  for (const app of applications || []) {
    const candidateId = app.candidate?.candidateId;
    if (!candidateId) continue;
    if (!candidateToApplication.has(candidateId)) {
      candidateToApplication.set(candidateId, app);
    }
  }

  const analysisByApplicationId = new Map<string, BackendChatAnswerSummary>();
  const analysisRequests = Array.from(candidateToApplication.values())
    .map((app) => app.applicationId)
    .filter((appId): appId is string => Boolean(appId));

  await Promise.all(
    analysisRequests.map(async (appId) => {
      try {
        const summary = await getJson<BackendChatAnswerSummary>(`/api/chat-answers/summary/${appId}`);
        analysisByApplicationId.set(appId, summary);
      } catch {
        // Certaines candidatures n'ont pas encore de réponses exploitables.
      }
    }),
  );

  const candidates: Candidate[] = (backendCandidates || []).map((item) => {
    const app = candidateToApplication.get(item.candidateId);
    const status = mapCandidateStatus(app?.status?.code || app?.status?.label, item.inPool);
    const analysis = app?.applicationId ? analysisByApplicationId.get(app.applicationId) : null;
    const tri = mapTriCategory(status);

    const motivationSummary = analysis?.motivationSummary?.trim()
      || (item.school ? `Formation: ${item.school}` : 'Resume non disponible.');
    const motivationAssessment = analysis?.motivationAssessment?.trim() || '';
    const mentionedProjects = analysis?.mentionedProjects || [];
    const projectAssessment = analysis?.projectAssessment?.trim() || '';
    const githubSummary = analysis?.githubSummary?.trim() || '';
    const githubAssessment = analysis?.githubAssessment?.trim() || '';
    const technicalSkills = analysis?.technicalSkills || [];
    const strengths = analysis?.strengths || [];
    const missingInfo = analysis?.missingInformation || [];
    const inconsistencies = analysis?.inconsistencies || analysis?.analysisSchema?.contradictions || [];
    const pointsToConfirm = analysis?.pointsToConfirm || [];
    const projectSummaryParts = [
      ...(mentionedProjects.length > 0 ? [mentionedProjects.join(', ')] : []),
      ...(githubSummary ? [githubSummary] : []),
    ];
    const analysisFacts: AnalysisFact[] = (analysis?.analysisSchema?.facts || [])
      .filter((fact) => (fact?.finding || '').trim().length > 0 && (fact?.evidence || '').trim().length > 0)
      .map((fact) => ({
        dimension: (fact.dimension || 'general').trim(),
        finding: (fact.finding || '').trim(),
        evidence: (fact.evidence || '').trim(),
        confidence: Number.isFinite(fact.confidence) ? Math.max(0, Math.min(1, Number(fact.confidence))) : 0.5,
        source_question: (fact.sourceQuestion || '').trim(),
      }));

    return {
      id: item.candidateId,
      application_id: app?.applicationId || null,
      application_created_at: app?.createdAt || null,
      first_name: item.firstName || 'Prenom',
      last_name: item.lastName || 'Nom',
      email: item.email || 'email@inconnu.local',
      phone: item.phone ?? null,
      cv_url: item.cvPath ? `/api/files/candidate/${item.candidateId}/cv/content` : null,
      cv_content_type: item.cvContentType ?? null,
      cv_file_name: item.cvFileName ?? null,
      tri_category: tri,
      status,
      alternance_compatible: true,
      disponibilite: analysis?.availabilityAssessment?.trim() || (analysis?.hasClearAvailability ? 'Definie' : 'A definir'),
      rythme_alternance: analysis?.hasClearAvailability ? 'Precise' : 'A definir',
      motivation_summary: motivationSummary,
      motivation_assessment: motivationAssessment,
      projet_cite: projectSummaryParts.length > 0 ? projectSummaryParts.join(' | ') : (item.location ? `Localisation: ${item.location}` : ''),
      projet_assessment: projectAssessment,
      technologies: technicalSkills,
      github_url: item.githubUrl ?? null,
      portfolio_url: item.portfolioUrl ?? null,
      github_assessment: githubAssessment,
      location_assessment: analysis?.locationAssessment?.trim() || '',
      points_forts: strengths,
      points_attention: Array.from(new Set([...missingInfo, ...inconsistencies, ...pointsToConfirm])),
      action_recommandee: mapRecommendedActionLabel(analysis?.recommendedAction, analysis?.recruiterGuidance),
      analysis_schema_version: analysis?.analysisSchema?.version?.trim() || null,
      analysis_fallback_used: Boolean(analysis?.analysisSchema?.fallbackUsed),
      analysis_facts: analysisFacts,
      review_total_facts: Math.max(0, Number(analysis?.analysisReviewCoverage?.totalFacts || 0)),
      review_reviewed_facts: Math.max(0, Number(analysis?.analysisReviewCoverage?.reviewedFacts || 0)),
      review_completion_rate: Math.max(0, Math.min(1, Number(analysis?.analysisReviewCoverage?.completionRate || 0))),
      chatbot_responses: null,
      chatbot_completed: Boolean(analysis),
      offer_id: app?.job?.jobId || null,
      user_id: null,
      created_at: item.createdAt || new Date().toISOString(),
    };
  });

  const candidatesCountByOffer = new Map<string, number>();
  for (const candidate of candidates) {
    if (!candidate.offer_id) continue;
    candidatesCountByOffer.set(candidate.offer_id, (candidatesCountByOffer.get(candidate.offer_id) || 0) + 1);
  }

  const offers: Offer[] = (jobs || []).map((job) => {
    const status = normalizeOfferStatus(job.statut);
    const createdAt = job.createdAt || new Date().toISOString();
    return {
      id: job.jobId,
      title: job.title || 'Poste sans titre',
      context: job.contextePoste || job.description || '',
      missions: job.missionsDetaillees || job.description || '',
      service: job.serviceEntreprise || 'Service non renseigne',
      location: job.location || 'Non renseigne',
      rythme: job.alternanceRhythm || 'Non renseigne',
      technologies: job.technologies || [],
      status,
      chatbot_url: `${window.location.origin}/apply/${job.jobId}`,
      candidates_count: candidatesCountByOffer.get(job.jobId) || 0,
      created_at: createdAt,
      updated_at: createdAt,
      user_id: null,
    };
  });

  return { offers, candidates };
}

export async function loadChatbotQuestions(jobId: string): Promise<ChatbotQuestion[]> {
  try {
    const questions = await getJson<BackendChatbotQuestion[]>(`/api/jobs/${jobId}/questions`);
    return (questions || [])
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((q, idx) => ({
        id: q.id || `q-${idx + 1}`,
        text: q.questionText || '',
        type: q.answerType || 'open',
        required: q.required ?? true,
        order: q.orderIndex || idx + 1,
      }));
  } catch {
    return [];
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function saveChatbotQuestions(jobId: string, questions: ChatbotQuestion[]): Promise<ChatbotQuestion[]> {
  const existing = await getJson<BackendChatbotQuestion[]>(`/api/jobs/${jobId}/questions`);
  const existingIds = new Set((existing || []).map((q) => q.id).filter((id): id is string => Boolean(id)));

  const normalized = questions
    .map((q, idx) => ({ ...q, order: idx + 1, text: (q.text || '').trim() }))
    .filter((q) => q.text.length > 0);

  const incomingPersistedIds = new Set(
    normalized.map((q) => q.id).filter((id): id is string => Boolean(id) && isUuid(id)),
  );

  for (const existingId of existingIds) {
    if (!incomingPersistedIds.has(existingId)) {
      await deleteJson(`/api/jobs/${jobId}/questions/${existingId}`);
    }
  }

  for (const question of normalized) {
    const payload = {
      questionText: question.text,
      orderIndex: question.order,
      answerType: question.type,
      required: question.required,
    };

    if (question.id && isUuid(question.id) && existingIds.has(question.id)) {
      await putJson(`/api/jobs/${jobId}/questions/${question.id}`, payload);
    } else {
      await postJson(`/api/jobs/${jobId}/questions`, payload);
    }
  }

  return loadChatbotQuestions(jobId);
}

export async function loadAnalysisFactFeedback(applicationId: string): Promise<AnalysisFactFeedback[]> {
  const entries = await getJson<BackendAnalysisFactFeedback[]>(`/api/chat-answers/feedback/${applicationId}`);
  return (entries || []).map((item) => ({
    feedback_id: item.feedbackId || '',
    application_id: item.applicationId || applicationId,
    dimension: item.dimension || 'general',
    finding: item.finding || '',
    evidence: item.evidence || '',
    decision: (item.decision || 'CONFIRMED') as AnalysisFactFeedbackDecision,
    corrected_finding: item.correctedFinding || '',
    reviewer_comment: item.reviewerComment || '',
    created_at: item.createdAt || new Date().toISOString(),
  }));
}

export async function loadLatestAnalysisFactFeedback(applicationId: string): Promise<AnalysisFactFeedback[]> {
  const entries = await getJson<BackendAnalysisFactFeedback[]>(`/api/chat-answers/feedback/${applicationId}/latest`);
  return (entries || []).map((item) => ({
    feedback_id: item.feedbackId || '',
    application_id: item.applicationId || applicationId,
    dimension: item.dimension || 'general',
    finding: item.finding || '',
    evidence: item.evidence || '',
    decision: (item.decision || 'CONFIRMED') as AnalysisFactFeedbackDecision,
    corrected_finding: item.correctedFinding || '',
    reviewer_comment: item.reviewerComment || '',
    created_at: item.createdAt || new Date().toISOString(),
  }));
}

export async function loadApplicationComments(applicationId: string): Promise<ApplicationComment[]> {
  const entries = await getJson<BackendApplicationComment[]>(`/api/applications/${applicationId}/comments`);
  return (entries || []).map((item) => ({
    id: item.id || '',
    application_id: item.applicationId || applicationId,
    company_id: item.companyId || '',
    author_user_id: item.authorUserId || null,
    author_recruiter_id: item.authorRecruiterId || null,
    author_name: item.authorName || 'Utilisateur interne',
    author_email: item.authorEmail || null,
    content: item.content || '',
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || null,
  }));
}

export async function createApplicationComment(applicationId: string, content: string): Promise<ApplicationComment> {
  const created = await postJson<BackendApplicationComment>(`/api/applications/${applicationId}/comments`, { content });
  return {
    id: created.id || '',
    application_id: created.applicationId || applicationId,
    company_id: created.companyId || '',
    author_user_id: created.authorUserId || null,
    author_recruiter_id: created.authorRecruiterId || null,
    author_name: created.authorName || 'Utilisateur interne',
    author_email: created.authorEmail || null,
    content: created.content || content,
    created_at: created.createdAt || new Date().toISOString(),
    updated_at: created.updatedAt || null,
  };
}

export async function loadApplicationActivities(applicationId: string): Promise<ApplicationActivity[]> {
  const entries = await getJson<BackendApplicationActivity[]>(`/api/applications/${applicationId}/activities`);
  return (entries || []).map((item) => ({
    id: item.id || '',
    application_id: item.applicationId || applicationId,
    company_id: item.companyId || '',
    actor_user_id: item.actorUserId || null,
    actor_recruiter_id: item.actorRecruiterId || null,
    event_type: item.eventType || 'APPLICATION_EVENT',
    title: item.title || 'Activite',
    description: item.description || '',
    created_at: item.createdAt || new Date().toISOString(),
  }));
}

export async function loadMyInAppNotifications(): Promise<{ notifications: InAppNotification[]; unreadCount: number }> {
  const response = await getJson<BackendInAppNotificationListResponse>('/api/internal-notifications/me');
  const notifications = (response.notifications || []).map((item) => ({
    id: item.id || '',
    type: item.type || 'info',
    title: item.title || 'Notification',
    message: item.message || '',
    read: Boolean(item.read),
    reference_type: item.referenceType || '',
    reference_id: item.referenceId || null,
    created_at: item.createdAt || new Date().toISOString(),
  }));

  return {
    notifications,
    unreadCount: Number(response.unreadCount || 0),
  };
}

export async function markInAppNotificationAsRead(notificationId: string): Promise<void> {
  await patchJson<void>(`/api/internal-notifications/${notificationId}/read`, {});
}

export async function markAllInAppNotificationsAsRead(): Promise<void> {
  await patchJson<void>('/api/internal-notifications/read-all', {});
}

export async function submitAnalysisFactFeedback(applicationId: string, payload: {
  dimension: string;
  finding: string;
  evidence: string;
  decision: AnalysisFactFeedbackDecision;
  correctedFinding?: string;
  reviewerComment?: string;
}): Promise<AnalysisFactFeedback> {
  const saved = await postJson<BackendAnalysisFactFeedback>(`/api/chat-answers/feedback/${applicationId}`, payload);
  return {
    feedback_id: saved.feedbackId || '',
    application_id: saved.applicationId || applicationId,
    dimension: saved.dimension || payload.dimension,
    finding: saved.finding || payload.finding,
    evidence: saved.evidence || payload.evidence,
    decision: (saved.decision || payload.decision) as AnalysisFactFeedbackDecision,
    corrected_finding: saved.correctedFinding || '',
    reviewer_comment: saved.reviewerComment || '',
    created_at: saved.createdAt || new Date().toISOString(),
  };
}

// ─── Quota / paramètres offre ──────────────────────────────────────────────

export type JobQuotaSettings = {
  maxCandidatures: number | null;
  autoClose: boolean;
};

export async function loadJobQuotaSettings(offerId: string): Promise<JobQuotaSettings> {
  const res = await getJson<{ maxCandidatures: number | null; autoClose: boolean }>(
    `/api/jobs/${offerId}/settings`,
  );
  return { maxCandidatures: res.maxCandidatures ?? null, autoClose: res.autoClose ?? true };
}

export async function saveJobQuotaSettings(offerId: string, settings: JobQuotaSettings): Promise<void> {
  await patchJson(`/api/jobs/${offerId}/settings`, {
    maxCandidatures: settings.maxCandidatures,
    autoClose: settings.autoClose,
  });
}