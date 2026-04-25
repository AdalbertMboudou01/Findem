import { deleteJson, getJson, postJson, putJson } from './api';
import type { Candidate, CandidateStatus, ChatbotQuestion, Offer, OfferStatus, TriCategory } from '../types';

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
  company?: { companyId?: string };
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
};

export type OfferDraftInput = {
  title: string;
  context: string;
  missions: string;
  service: string;
  location: string;
  rythme: string;
  technologies: string[];
};

function normalizeOfferStatus(raw?: string): OfferStatus {
  const value = (raw || '').toLowerCase();
  if (value.includes('pause')) return 'pause';
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

function toSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeContractDuration(raw: string) {
  const value = (raw || '').trim().toLowerCase();
  if (!value) return null;

  if (value === '6' || value === '6m' || value === '6 mois' || value === '6 month' || value === '6 months') return '6 mois';
  if (value === '12' || value === '12m' || value === '12 mois' || value === '12 month' || value === '12 months') return '12 mois';
  if (value === '24' || value === '24m' || value === '24 mois' || value === '24 month' || value === '24 months') return '24 mois';
  if (value === '36' || value === '36m' || value === '36 mois' || value === '36 month' || value === '36 months') return '36 mois';
  return null;
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
      return { code: 'vivier', label: 'Vivier' };
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

export async function upsertOffer(offerId: string | null, input: OfferDraftInput) {
  const description = [input.context, input.missions].filter(Boolean).join('\n\n');
  const contractDuration = normalizeContractDuration(input.rythme);

  if (!contractDuration) {
    throw new Error('La duree du contrat doit etre: 6 mois, 12 mois, 24 mois ou 36 mois.');
  }

  if (offerId) {
    const current = await getJson<BackendJob>(`/api/jobs/${offerId}`);
    await putJson(`/api/jobs/${offerId}`, {
      ...current,
      title: input.title,
      description,
      location: input.location,
      alternanceRhythm: contractDuration,
      technologies: input.technologies,
      contextePoste: input.context,
      missionsDetaillees: input.missions,
      serviceEntreprise: input.service,
      statut: current.statut || 'ouvert',
      slug: current.slug || toSlug(input.title),
    });
    return;
  }

  const ownerIds = await getJobOwnerIds();
  await postJson('/api/jobs', {
    title: input.title,
    description,
    location: input.location,
    alternanceRhythm: contractDuration,
    blockingCriteria: {},
    slug: toSlug(input.title),
    companyId: ownerIds.companyId,
    ownerRecruiterId: ownerIds.ownerRecruiterId,
  });
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

  const candidates: Candidate[] = (backendCandidates || []).map((item) => {
    const app = candidateToApplication.get(item.candidateId);
    const status = mapCandidateStatus(app?.status?.code || app?.status?.label, item.inPool);
    const tri = mapTriCategory(status);

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
      disponibilite: 'A definir',
      rythme_alternance: 'A definir',
      motivation_summary: item.school ? `Formation: ${item.school}` : 'Resume non disponible.',
      projet_cite: item.location ? `Localisation: ${item.location}` : '',
      technologies: [],
      github_url: item.githubUrl ?? null,
      portfolio_url: item.portfolioUrl ?? null,
      points_attention: [],
      action_recommandee: status === 'retenu_entretien' ? 'Entretien recommande' : 'Analyse complementaire recommandee',
      chatbot_responses: null,
      chatbot_completed: false,
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
        type: 'open',
        required: true,
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
    };

    if (question.id && isUuid(question.id) && existingIds.has(question.id)) {
      await putJson(`/api/jobs/${jobId}/questions/${question.id}`, payload);
    } else {
      await postJson(`/api/jobs/${jobId}/questions`, payload);
    }
  }

  return loadChatbotQuestions(jobId);
}