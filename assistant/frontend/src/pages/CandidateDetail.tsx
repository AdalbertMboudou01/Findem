import { useParams, Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Github,
  Globe,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Eye,
  XCircle,
  Archive,
  ChevronLeft,
  FileText,
  Code2,
  MessageSquare,
  MessageCircle,
  Download,
  StickyNote,
  History,
  Send,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { TriBadge, StatusBadge } from '../components/ui/Badge';
import type { AnalysisFactFeedback, AnalysisFactFeedbackDecision, Candidate, CandidateStatus, Offer } from '../types';
import { useEffect, useMemo, useState } from 'react';
import { loadAnalysisFactFeedback, loadRecruitmentData, setCandidateDecision, submitAnalysisFactFeedback } from '../lib/domainApi';
import { getBlob, getJson } from '../lib/api';

type ChatAnswerApi = {
  messageId: string;
  questionText?: string;
  answer?: string;
  createdAt?: string;
};

const statusActions: { status: CandidateStatus; label: string; icon: typeof UserCheck; cls: string }[] = [
  { status: 'retenu_entretien', label: 'Retenir', icon: UserCheck, cls: 'bg-t-success text-white' },
  { status: 'a_revoir_manuellement', label: 'A revoir', icon: Eye, cls: 'bg-t-warning text-white' },
  { status: 'vivier', label: 'Vivier', icon: Archive, cls: 'bg-t-brand-80 text-white' },
  { status: 'non_retenu', label: 'Ecarter', icon: XCircle, cls: 'bg-t-danger text-white' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function CandidateEmpty() {
  return (
    <div className="flex-1 flex items-center justify-center bg-t-bg3">
      <div className="text-center">
        <FileText className="w-12 h-12 mx-auto mb-3 text-t-fg-disabled" strokeWidth={1} />
        <p className="text-body1 text-t-fg3">Selectionnez un candidat</p>
        <p className="text-caption1 text-t-fg-disabled mt-1">La fiche synthetique s'affichera ici</p>
      </div>
    </div>
  );
}

type DetailTab = 'synthese' | 'chatbot' | 'cv' | 'notes' | 'historique';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState<DetailTab>('synthese');
  const [chatbotResponses, setChatbotResponses] = useState<{ question: string; answer: string }[]>([]);
  const [chatbotCompletedAt, setChatbotCompletedAt] = useState<string | null>(null);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const [factFeedback, setFactFeedback] = useState<AnalysisFactFeedback[]>([]);
  const [factFeedbackError, setFactFeedbackError] = useState('');
  const [factDrafts, setFactDrafts] = useState<Record<string, { decision: AnalysisFactFeedbackDecision; correctedFinding: string; reviewerComment: string; saving: boolean }>>({});
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<{ text: string; date: string; author: string }[]>([
    { text: 'Profil interessant, bon projet e-commerce. A contacter rapidement.', date: '2026-04-22T10:30:00Z', author: 'Recruteur' },
  ]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadRecruitmentData();
        if (!mounted) return;
        setCandidates(data.candidates);
        setOffers(data.offers);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Impossible de charger le candidat.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function refreshDetailData() {
    const data = await loadRecruitmentData();
    setCandidates(data.candidates);
    setOffers(data.offers);
  }

  async function handleStatusChange(status: CandidateStatus) {
    if (!id) return;
    setActionError('');
    setActionLoading(true);
    try {
      await setCandidateDecision(id, status);
      await refreshDetailData();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Impossible de mettre a jour le statut du candidat.');
    } finally {
      setActionLoading(false);
    }
  }

  const c = useMemo(() => candidates.find((item) => item.id === id), [candidates, id]);

  useEffect(() => {
    let mounted = true;

    async function loadCandidateChatbotResponses() {
      if (!c?.application_id) {
        if (mounted) {
          setChatbotResponses(c?.chatbot_responses || []);
          setChatbotCompletedAt(null);
        }
        return;
      }

      setChatbotLoading(true);
      try {
        const answers = await getJson<ChatAnswerApi[]>(`/api/chat/application/${c.application_id}/answers`);
        if (!mounted) return;

        const latestAnswerTimestamp = (answers || [])
          .map((a) => a.createdAt)
          .filter((v): v is string => Boolean(v))
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;

        const mapped = (answers || [])
          .map((a) => ({ question: a.questionText || 'Question', answer: a.answer || '' }))
          .filter((a) => a.answer.trim().length > 0);
        setChatbotResponses(mapped);
        setChatbotCompletedAt(latestAnswerTimestamp);
      } catch {
        if (!mounted) return;
        setChatbotResponses(c.chatbot_responses || []);
        setChatbotCompletedAt(null);
      } finally {
        if (mounted) setChatbotLoading(false);
      }
    }

    loadCandidateChatbotResponses();

    return () => {
      mounted = false;
    };
  }, [c]);

  useEffect(() => {
    let mounted = true;

    async function loadFeedback() {
      if (!c?.application_id) {
        if (mounted) {
          setFactFeedback([]);
          setFactFeedbackError('');
        }
        return;
      }

      try {
        const data = await loadAnalysisFactFeedback(c.application_id);
        if (!mounted) return;
        setFactFeedback(data);
        setFactFeedbackError('');
      } catch {
        if (!mounted) return;
        setFactFeedbackError('Impossible de charger les corrections recruteur.');
      }
    }

    loadFeedback();

    return () => {
      mounted = false;
    };
  }, [c?.application_id]);

  function feedbackKey(dimension: string, finding: string) {
    return `${dimension}::${finding}`;
  }

  function ensureDraft(key: string) {
    const existing = factDrafts[key];
    if (existing) return existing;
    return { decision: 'CONFIRMED' as const, correctedFinding: '', reviewerComment: '', saving: false };
  }

  function updateDraft(key: string, patch: Partial<{ decision: AnalysisFactFeedbackDecision; correctedFinding: string; reviewerComment: string; saving: boolean }>) {
    setFactDrafts((prev) => ({
      ...prev,
      [key]: { ...ensureDraft(key), ...patch },
    }));
  }

  async function submitFactReview(key: string, payload: { dimension: string; finding: string; evidence: string }) {
    if (!c?.application_id) return;

    const draft = ensureDraft(key);
    if (draft.decision === 'CORRECTED' && !draft.correctedFinding.trim()) {
      setFactFeedbackError('La correction est obligatoire quand la decision est CORRECTED.');
      return;
    }

    updateDraft(key, { saving: true });
    setFactFeedbackError('');
    try {
      const saved = await submitAnalysisFactFeedback(c.application_id, {
        dimension: payload.dimension,
        finding: payload.finding,
        evidence: payload.evidence,
        decision: draft.decision,
        correctedFinding: draft.correctedFinding,
        reviewerComment: draft.reviewerComment,
      });

      setFactFeedback((prev) => [saved, ...prev]);
      setFactDrafts((prev) => ({
        ...prev,
        [key]: { decision: 'CONFIRMED', correctedFinding: '', reviewerComment: '', saving: false },
      }));
    } catch {
      setFactFeedbackError('Impossible d\'enregistrer cette correction.');
      updateDraft(key, { saving: false });
    }
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-t-bg3 text-body1 text-t-fg3">Chargement du candidat...</div>;
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center bg-t-bg3 text-body1 text-t-danger">{error}</div>;
  }

  if (!c) {
    return <div className="flex-1 flex items-center justify-center bg-t-bg3 text-body1 text-t-fg3">Candidat introuvable</div>;
  }

  const offer = offers.find((o) => o.id === c.offer_id);
  const applicationCreatedAt = c.application_created_at || c.created_at;
  const chatbotCompletedAtDisplay = chatbotCompletedAt || applicationCreatedAt;

  const timeline = [
    { action: 'Candidature recue via chatbot', date: applicationCreatedAt, type: 'info' as const },
    { action: 'Chatbot complete', date: chatbotCompletedAtDisplay, type: 'success' as const },
    ...(c.tri_category === 'prioritaire' ? [{ action: 'Classe comme Prioritaire', date: c.created_at, type: 'success' as const }] : []),
    ...(c.status === 'retenu_entretien' ? [{ action: 'Retenu pour entretien', date: c.created_at, type: 'success' as const }] : []),
    ...(c.status === 'non_retenu' ? [{ action: 'Non retenu — criteres bloquants', date: c.created_at, type: 'danger' as const }] : []),
    ...(c.status === 'vivier' ? [{ action: 'Place dans le vivier', date: c.created_at, type: 'info' as const }] : []),
  ];

  const tabs: { key: DetailTab; label: string; icon: typeof FileText }[] = [
    { key: 'synthese', label: 'Synthese', icon: FileText },
    { key: 'chatbot', label: 'Reponses', icon: MessageCircle },
    { key: 'cv', label: 'CV', icon: Download },
    { key: 'notes', label: 'Notes', icon: StickyNote },
    { key: 'historique', label: 'Historique', icon: History },
  ];

  function addNote() {
    if (!noteText.trim()) return;
    setNotes([{ text: noteText.trim(), date: new Date().toISOString(), author: 'Vous' }, ...notes]);
    setNoteText('');
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-t-bg3">
      {/* Header */}
      <div className="bg-t-bg1 border-b border-t-stroke2 px-3 sm:px-6 py-4 shrink-0">
        <div className="flex items-start gap-3 sm:gap-4">
          <Link to="/candidates" className="md:hidden w-8 h-8 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover transition-colors shrink-0 mt-0.5">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-t-brand-160 flex items-center justify-center text-body1 font-semibold text-t-brand-80 shrink-0">
            {c.first_name[0]}{c.last_name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-subtitle2 font-semibold text-t-fg1">{c.first_name} {c.last_name}</h2>
              <TriBadge category={c.tri_category} />
              <StatusBadge status={c.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-caption1 text-t-fg3">
              <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" /><span className="truncate max-w-[180px] sm:max-w-none">{c.email}</span></span>
              {c.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
              <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{c.disponibilite}</span>
              <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{c.rythme_alternance}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            {statusActions.map((a) => (
              <button
                key={a.status}
                onClick={() => handleStatusChange(a.status)}
                disabled={actionLoading}
                className={`h-7 px-2.5 text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1 hover:opacity-90 disabled:opacity-40 transition-opacity ${a.cls}`}
              >
                <a.icon className="w-3.5 h-3.5" />{a.label}
              </button>
            ))}
          </div>
        </div>
        {actionError && (
          <div className="mt-3 px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-t-danger rounded-fluent">
            {actionError}
          </div>
        )}
        {/* Mobile status actions */}
        <div className="flex sm:hidden items-center gap-1.5 mt-3 overflow-x-auto">
          {statusActions.map((a) => (
            <button
              key={a.status}
              onClick={() => handleStatusChange(a.status)}
              disabled={actionLoading}
              className={`h-7 px-2.5 text-caption1 font-semibold rounded-fluent inline-flex items-center gap-1 hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 ${a.cls}`}
            >
              <a.icon className="w-3.5 h-3.5" />{a.label}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 mt-3 -mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2.5 text-caption1 font-semibold border-b-2 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key ? 'border-t-stroke-brand text-t-fg-brand' : 'border-transparent text-t-fg3 hover:text-t-fg2'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
        {activeTab === 'synthese' && (
          <div className="max-w-[800px] space-y-3">
            <Section icon={MessageSquare} title="Motivation">
              {c.motivation_assessment && (
                <p className="text-caption1 text-t-fg2 mb-2">{c.motivation_assessment}</p>
              )}
              <p className="text-body1 text-t-fg1 leading-relaxed">{c.motivation_summary}</p>
            </Section>

            {c.projet_cite && (
              <Section icon={FileText} title="Projet / Experience">
                {c.projet_assessment && (
                  <p className="text-caption1 text-t-fg2 mb-2">{c.projet_assessment}</p>
                )}
                <p className="text-body1 text-t-fg1 leading-relaxed">{c.projet_cite}</p>
              </Section>
            )}

            {c.technologies.length > 0 && (
              <Section icon={Code2} title="Signaux techniques">
                {c.github_assessment && (
                  <p className="text-caption1 text-t-fg2 mb-3">{c.github_assessment}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {c.technologies.map((t) => (
                    <span key={t} className="px-2 py-0.5 text-caption1 bg-t-bg3 text-t-fg2 rounded-fluent">{t}</span>
                  ))}
                </div>
                {(c.github_url || c.portfolio_url) && (
                  <div className="flex items-center gap-4 mt-3">
                    {c.github_url && (
                      <a href={c.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-caption1 text-t-fg-brand hover:underline">
                        <Github className="w-3.5 h-3.5" />GitHub
                      </a>
                    )}
                    {c.portfolio_url && (
                      <a href={c.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-caption1 text-t-fg-brand hover:underline">
                        <Globe className="w-3.5 h-3.5" />Portfolio
                      </a>
                    )}
                  </div>
                )}
              </Section>
            )}

            {c.points_forts.length > 0 && (
              <div className="bg-t-success-bg border border-t-stroke2 rounded-fluent px-5 py-4">
                <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-success uppercase tracking-wider mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />Points forts observes
                </h3>
                <ul className="space-y-1">
                  {c.points_forts.map((p, i) => (
                    <li key={i} className="text-body1 text-t-fg1 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-t-success mt-2 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c.points_attention.length > 0 && (
              <div className="bg-t-warning-bg border border-t-stroke2 rounded-fluent px-5 py-4">
                <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-warning uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />Points d'attention
                </h3>
                <ul className="space-y-1">
                  {c.points_attention.map((p, i) => (
                    <li key={i} className="text-body1 text-t-fg1 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-t-warning mt-2 shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c.analysis_facts.length > 0 && (
              <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-2">
                  <MessageCircle className="w-3.5 h-3.5" />Constats observes avec preuves
                </h3>
                {c.analysis_schema_version && (
                  <p className="text-caption1 text-t-fg3 mb-3">Schema: {c.analysis_schema_version}</p>
                )}
                <ul className="space-y-3">
                  {c.analysis_facts.map((fact, i) => (
                    <li key={`${fact.dimension}-${i}`} className="border border-t-stroke3 rounded-fluent p-3 bg-t-bg2">
                      <p className="text-body1 text-t-fg1 font-medium">{fact.finding}</p>
                      <p className="text-caption1 text-t-fg3 mt-1">Preuve: {fact.evidence}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-caption1 text-t-fg3">
                        <span>Dimension: {fact.dimension}</span>
                        <span>Confiance: {Math.round(fact.confidence * 100)}%</span>
                        {fact.source_question && <span>Source: {fact.source_question}</span>}
                      </div>
                      {(() => {
                        const key = feedbackKey(fact.dimension, fact.finding);
                        const draft = ensureDraft(key);
                        const latestFeedback = factFeedback.find((entry) => entry.dimension === fact.dimension && entry.finding === fact.finding);
                        return (
                          <div className="mt-3 border-t border-t-stroke3 pt-3">
                            {latestFeedback && (
                              <p className="text-caption1 text-t-fg3 mb-2">
                                Derniere revue: {latestFeedback.decision}
                                {latestFeedback.corrected_finding ? ` | Correction: ${latestFeedback.corrected_finding}` : ''}
                              </p>
                            )}
                            <div className="grid sm:grid-cols-3 gap-2">
                              <select
                                value={draft.decision}
                                onChange={(e) => updateDraft(key, { decision: e.target.value as AnalysisFactFeedbackDecision })}
                                className="h-9 rounded-fluent border border-t-stroke3 bg-t-bg1 px-2 text-caption1"
                                disabled={draft.saving}
                              >
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="CORRECTED">CORRECTED</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                              <input
                                value={draft.correctedFinding}
                                onChange={(e) => updateDraft(key, { correctedFinding: e.target.value })}
                                className="h-9 rounded-fluent border border-t-stroke3 bg-t-bg1 px-2 text-caption1 sm:col-span-2"
                                placeholder="Correction proposee (si CORRECTED)"
                                disabled={draft.saving}
                              />
                            </div>
                            <div className="mt-2 flex gap-2">
                              <input
                                value={draft.reviewerComment}
                                onChange={(e) => updateDraft(key, { reviewerComment: e.target.value })}
                                className="h-9 rounded-fluent border border-t-stroke3 bg-t-bg1 px-2 text-caption1 flex-1"
                                placeholder="Commentaire recruteur (optionnel)"
                                disabled={draft.saving}
                              />
                              <button
                                onClick={() => submitFactReview(key, {
                                  dimension: fact.dimension,
                                  finding: fact.finding,
                                  evidence: fact.evidence,
                                })}
                                className="h-9 px-3 rounded-fluent bg-t-brand-80 text-white text-caption1 font-semibold disabled:opacity-50"
                                disabled={draft.saving}
                              >
                                {draft.saving ? 'Enregistrement...' : 'Valider'}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
                {factFeedbackError && (
                  <p className="text-caption1 text-t-danger mt-3">{factFeedbackError}</p>
                )}
                {c.analysis_fallback_used && (
                  <p className="text-caption1 text-t-warning mt-3">
                    Certains constats proviennent d'un fallback technique car l'extraction semantique etait partielle.
                  </p>
                )}
              </div>
            )}

            <div className="bg-t-brand-160 border border-t-brand-140 rounded-fluent px-5 py-4">
              <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-brand-80 uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />Lecture recruteur
              </h3>
              <p className="text-body1 text-t-brand-70">{c.action_recommandee}</p>
            </div>

            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetaItem label="Offre" value={offer?.title || '-'} />
                <MetaItem label="Alternance" value={c.alternance_compatible ? 'Compatible' : 'Non compatible'} />
                <MetaItem label="Chatbot" value={c.chatbot_completed ? 'Termine' : 'Incomplet'} />
                <MetaItem label="Candidature" value={formatDate(c.created_at)} />
              </div>
              {c.location_assessment && (
                <p className="text-caption1 text-t-fg3 mt-4">{c.location_assessment}</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chatbot' && (
          <div className="max-w-[800px] space-y-3">
            {chatbotLoading ? (
              <div className="text-center py-12 text-caption1 text-t-fg3">Chargement des reponses...</div>
            ) : chatbotResponses && chatbotResponses.length > 0 ? (
              chatbotResponses.map((r, i) => (
                <div key={i} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-t-brand-160 flex items-center justify-center shrink-0 mt-0.5">
                      <MessageCircle className="w-3 h-3 text-t-brand-80" />
                    </div>
                    <p className="text-caption1 font-semibold text-t-fg2">{r.question}</p>
                  </div>
                  <div className="ml-9">
                    <p className="text-body1 text-t-fg1 leading-relaxed">{r.answer}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-caption1 text-t-fg3">Aucune reponse chatbot</div>
            )}
          </div>
        )}

        {activeTab === 'cv' && <CvViewer candidate={c} />}

        {activeTab === 'notes' && (
          <div className="max-w-[800px] space-y-4">
            {/* Add note */}
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
              <h3 className="text-caption1 font-semibold text-t-fg2 mb-2">Ajouter une note</h3>
              <div className="flex gap-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  placeholder="Ecrivez une note interne sur ce candidat..."
                  className="flex-1 px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
                />
                <button
                  onClick={addNote}
                  disabled={!noteText.trim()}
                  className="self-end h-8 px-3 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent inline-flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />Envoyer
                </button>
              </div>
            </div>

            {/* Notes list */}
            {notes.map((note, i) => (
              <div key={i} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption1 font-semibold text-t-fg2">{note.author}</span>
                  <span className="text-caption2 text-t-fg3">{formatDateTime(note.date)}</span>
                </div>
                <p className="text-body1 text-t-fg1 leading-relaxed">{note.text}</p>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="text-center py-8 text-caption1 text-t-fg3">Aucune note pour ce candidat</div>
            )}
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="max-w-[800px]">
            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
              <div className="space-y-0">
                {timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-3 relative pb-4 last:pb-0">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-[2px] bg-t-stroke3" />
                    )}
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-0.5 flex items-center justify-center ${
                      event.type === 'success' ? 'bg-t-success-bg' : event.type === 'danger' ? 'bg-t-danger-bg' : 'bg-t-bg4'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        event.type === 'success' ? 'bg-t-success' : event.type === 'danger' ? 'bg-t-danger' : 'bg-t-fg3'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-body1 text-t-fg1">{event.action}</p>
                      <span className="text-caption2 text-t-fg3">{formatDateTime(event.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CvViewer({ candidate }: { candidate: Candidate }) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerBlobUrl, setViewerBlobUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState('');
  const [viewerLoading, setViewerLoading] = useState(false);

  useEffect(() => {
    let revokedUrl: string | null = null;
    let mounted = true;

    async function loadCvBlob() {
      if (!candidate.cv_url) {
        setViewerBlobUrl(null);
        setViewerError('');
        return;
      }

      setViewerLoading(true);
      setViewerError('');
      try {
        const blob = await getBlob(candidate.cv_url);
        if (!mounted) return;
        const objectUrl = URL.createObjectURL(blob);
        revokedUrl = objectUrl;
        setViewerBlobUrl(objectUrl);
      } catch (err) {
        if (!mounted) return;
        setViewerBlobUrl(null);
        setViewerError(err instanceof Error ? err.message : "Impossible de charger l'aperçu du CV.");
      } finally {
        if (mounted) setViewerLoading(false);
      }
    }

    loadCvBlob();

    return () => {
      mounted = false;
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [candidate.cv_url]);

  if (!candidate.cv_url) {
    return (
      <div className="max-w-[800px]">
        <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-16 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-t-fg-disabled" strokeWidth={1} />
          <p className="text-body1 text-t-fg3 mb-1">Aucun CV disponible</p>
          <p className="text-caption1 text-t-fg-disabled">Le CV doit etre fourni par le candidat via le formulaire de candidature.</p>
        </div>
      </div>
    );
  }

  const isPdf = (candidate.cv_content_type || '').toLowerCase().includes('pdf');

  function handleZoomIn() {
    setZoom((z) => Math.min(z + 25, 200));
  }
  function handleZoomOut() {
    setZoom((z) => Math.max(z - 25, 50));
  }
  function resetZoom() {
    setZoom(100);
  }
  function toggleFullscreen() {
    setIsFullscreen((f) => !f);
  }

  const containerCls = isFullscreen
    ? 'fixed inset-0 z-[100] bg-t-bg1 flex flex-col'
    : 'max-w-[800px]';

  return (
    <div className={containerCls}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-2 ${isFullscreen ? 'px-3 sm:px-4 py-3 border-b border-t-stroke2 bg-t-bg1 shrink-0' : 'mb-3'}`}>
        <div className="flex items-center gap-1.5 bg-t-bg1 border border-t-stroke3 rounded-fluent px-1">
          <button onClick={handleZoomOut} disabled={zoom <= 50} className="w-7 h-7 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover disabled:opacity-30 transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button onClick={resetZoom} className="h-7 px-2 text-caption1 font-medium text-t-fg2 hover:bg-t-bg1-hover rounded-fluent transition-colors min-w-[48px] text-center">
            {zoom}%
          </button>
          <button onClick={handleZoomIn} disabled={zoom >= 200} className="w-7 h-7 flex items-center justify-center rounded-fluent text-t-fg3 hover:bg-t-bg1-hover disabled:opacity-30 transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-t-stroke3 hidden sm:block" />

        <button onClick={toggleFullscreen} className="h-7 px-2.5 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors">
          <Maximize2 className="w-3.5 h-3.5" />{isFullscreen ? 'Quitter' : 'Plein ecran'}
        </button>

        <div className="flex-1" />

        <span className="hidden sm:inline text-caption1 text-t-fg3 mr-2">
          {candidate.first_name} {candidate.last_name} -- CV
        </span>

        <a
          href={viewerBlobUrl || candidate.cv_url}
          download
          className="h-7 px-2.5 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Telecharger</span>
        </a>
      </div>

      {/* PDF viewer */}
      <div className={`bg-t-bg4 border border-t-stroke3 rounded-fluent overflow-hidden ${isFullscreen ? 'flex-1' : ''}`}>
        {viewerLoading ? (
          <div className="w-full h-full flex items-center justify-center text-caption1 text-t-fg3" style={{ minHeight: isFullscreen ? undefined : '400px' }}>
            Chargement de l'aperçu...
          </div>
        ) : viewerError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-6" style={{ minHeight: isFullscreen ? undefined : '400px' }}>
            <p className="text-body2 text-t-fg2">Aucun aperçu disponible.</p>
            <p className="text-caption1 text-t-fg3">{viewerError}</p>
          </div>
        ) : !isPdf ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-center px-6" style={{ minHeight: isFullscreen ? undefined : '400px' }}>
            <p className="text-body2 text-t-fg2">Aperçu intégré indisponible pour ce format.</p>
            <p className="text-caption1 text-t-fg3">Ouvre le fichier dans un nouvel onglet ou télécharge-le.</p>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto flex justify-center" style={{ minHeight: isFullscreen ? undefined : '400px' }}>
            <iframe
              src={viewerBlobUrl || undefined}
              title={`CV de ${candidate.first_name} ${candidate.last_name}`}
              className="border-0"
              style={{
                width: `${zoom}%`,
                height: isFullscreen ? '100%' : '600px',
                minWidth: '280px',
                maxWidth: '100%',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof MessageSquare; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
      <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg3 uppercase tracking-wider mb-2.5">
        <Icon className="w-3.5 h-3.5" />{title}
      </h3>
      {children}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-caption2 text-t-fg3">{label}</span>
      <p className="text-caption1 text-t-fg1 mt-0.5">{value}</p>
    </div>
  );
}
