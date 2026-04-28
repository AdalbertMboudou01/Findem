import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, CheckCircle2, Send, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { getJson, postForm, postJson } from '../lib/api';
import { loadChatbotQuestions } from '../lib/domainApi';
import type { ChatbotQuestion } from '../types';

type ApplyResponse = { candidateId: string; applicationId: string };
type PublicJobSummary = {
  jobId: string;
  title: string;
  isAccepting?: boolean;
  accepting?: boolean;
  candidateCount: number;
  maxCandidatures: number | null;
};

type ChatAnswerPayload = {
  questionKey: string;
  questionText: string;
  answer: string;
  candidateId: string;
  applicationId: string;
};

type IdentityForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  githubUrl: string;
  portfolioUrl: string;
  consent: boolean;
};

export default function CandidateChatbot() {
  const { jobId = '' } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offerClosed, setOfferClosed] = useState(false);
  const [offerClosedReason, setOfferClosedReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<ChatbotQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);

  // Étape 0 : identification candidat
  const [step, setStep] = useState<'identity' | 'questions'>('identity');
  const [identity, setIdentity] = useState<IdentityForm>({
    firstName: '', lastName: '', email: '', phone: '', school: '', githubUrl: '', portfolioUrl: '', consent: false,
  });
  const [candidateId, setCandidateId] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [identityError, setIdentityError] = useState('');
  const [identitySubmitting, setIdentitySubmitting] = useState(false);
  const [questionError, setQuestionError] = useState('');

  useEffect(() => {
    async function bootstrap() {
      if (!jobId) {
        setError('Lien invalide: offre introuvable.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const summary = await getJson<PublicJobSummary>(`/api/jobs/${jobId}/public`);
        setJobTitle(summary.title || 'Offre');

        // Vérification du quota avant d'aller plus loin
        const isAccepting = summary.isAccepting ?? summary.accepting ?? true;
        if (!isAccepting) {
          if (summary.maxCandidatures != null) {
            setOfferClosedReason(
              `Cette offre a atteint son quota de ${summary.maxCandidatures} candidature${summary.maxCandidatures > 1 ? 's' : ''}.`,
            );
          } else {
            setOfferClosedReason('Cette offre est clôturée et n\'accepte plus de candidatures.');
          }
          setOfferClosed(true);
          setLoading(false);
          return;
        }

        const loaded = await loadChatbotQuestions(jobId);
        setQuestions(loaded);
        if (!loaded.length) {
          setError('Aucune question n\'est disponible pour cette offre.');
        } else {
          setError('');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les questions.');
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [jobId]);

  async function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!identity.firstName.trim() || !identity.lastName.trim() || !identity.email.trim()) {
      setIdentityError('Prénom, nom et email sont obligatoires.');
      return;
    }
    if (!identity.consent) {
      setIdentityError('Vous devez accepter le traitement de vos données.');
      return;
    }

    setIdentitySubmitting(true);
    setIdentityError('');
    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('firstName', identity.firstName.trim());
      formData.append('lastName', identity.lastName.trim());
      formData.append('email', identity.email.trim());
      formData.append('phone', identity.phone.trim());
      formData.append('school', identity.school.trim());
      formData.append('githubUrl', identity.githubUrl.trim());
      formData.append('portfolioUrl', identity.portfolioUrl.trim());
      formData.append('consent', 'true');

      const res = await postForm<ApplyResponse>('/api/apply', formData);
      setCandidateId(res.candidateId);
      setApplicationId(res.applicationId);
      setStep('questions');
    } catch (err) {
      setIdentityError(err instanceof Error ? err.message : 'Impossible d\'enregistrer votre profil.');
    } finally {
      setIdentitySubmitting(false);
    }
  }

  const currentQuestion = questions[index];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || '') : '';

  const progress = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((index + 1) / questions.length) * 100);
  }, [index, questions.length]);

  function setCurrentAnswer(value: string) {
    if (!currentQuestion) return;
    setQuestionError('');
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function isQuestionAnswered(question: ChatbotQuestion) {
    return (answers[question.id] || '').trim().length > 0;
  }

  function goToNextQuestion() {
    if (!currentQuestion) return;

    if (currentQuestion.required && !isQuestionAnswered(currentQuestion)) {
      setQuestionError('Cette question est obligatoire. Veuillez saisir une reponse pour continuer.');
      return;
    }

    setQuestionError('');
    setIndex((prev) => Math.min(questions.length - 1, prev + 1));
  }

  async function handleSubmit() {
    if (!questions.length) return;

    const missingRequired = questions.filter((q) => q.required && !isQuestionAnswered(q));
    if (missingRequired.length > 0) {
      setQuestionError('Toutes les questions obligatoires doivent etre renseignees avant envoi.');
      setError('Veuillez repondre a toutes les questions obligatoires.');
      const firstMissingIndex = questions.findIndex((q) => q.id === missingRequired[0].id);
      if (firstMissingIndex >= 0) {
        setIndex(firstMissingIndex);
      }
      return;
    }

    const payloads: ChatAnswerPayload[] = questions
      .map((q, i) => ({
        questionKey: q.id || `q-${i + 1}`,
        questionText: q.text,
        answer: (answers[q.id] || '').trim(),
        candidateId,
        applicationId,
      }))
      .filter((item) => item.answer.length > 0);

    setSubmitting(true);
    setError('');
    try {
      await Promise.all(payloads.map((item) => postJson('/api/chat/answer', item)));
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'envoyer les reponses.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-t-bg3 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-4 flex items-center gap-2 text-t-fg2">
          <Bot className="h-5 w-5 text-t-fg-brand" />
          <h1 className="text-subtitle2 font-semibold">Candidature - {jobTitle || 'Offre'}</h1>
        </div>

        {/* Chargement */}
        {loading && (
          <div className="rounded-fluent-lg border border-t-stroke3 bg-t-bg1 p-8 text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-t-brand-80 border-t-transparent" />
            <p className="text-caption1 text-t-fg3">Chargement de l'offre…</p>
          </div>
        )}

        {/* Offre fermée (quota atteint ou clôturée) */}
        {!loading && offerClosed && (
          <div className="rounded-fluent-lg border border-t-stroke3 bg-t-bg1 p-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-t-warning-bg flex items-center justify-center">
              <Lock className="w-7 h-7 text-t-warning" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-body1 font-semibold text-t-fg1 mb-2">Offre non disponible</h2>
              <p className="text-caption1 text-t-fg2">{offerClosedReason}</p>
            </div>
            <p className="text-caption2 text-t-fg3">
              Nous vous remercions de l'intérêt que vous portez à cette offre.
            </p>
          </div>
        )}

        {/* Erreur de chargement */}
        {/* Erreur de chargement (sans formulaire visible) */}
        {!loading && !offerClosed && error && !candidateId && step === 'identity' && questions.length === 0 && (
          <div className="rounded-fluent border border-t-danger bg-t-danger-bg px-4 py-3 text-caption1 text-t-danger">
            {error}
          </div>
        )}

        {/* Étape 0 : formulaire d'identification */}
        {!loading && !offerClosed && step === 'identity' && (
          <form
            onSubmit={handleIdentitySubmit}
            className="space-y-4 rounded-fluent-lg border border-t-stroke3 bg-t-bg1 p-5"
          >
            <h2 className="text-body1 font-semibold text-t-fg1">Vos informations</h2>
            <p className="text-caption1 text-t-fg3">Ces informations sont nécessaires pour associer vos réponses à votre candidature.</p>

            {identityError && (
              <div className="rounded-fluent border border-t-danger bg-t-danger-bg px-4 py-2 text-caption1 text-t-danger">
                {identityError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-caption1 text-t-fg2 mb-1">Prénom *</label>
                <input
                  type="text"
                  required
                  value={identity.firstName}
                  onChange={(e) => setIdentity((p) => ({ ...p, firstName: e.target.value }))}
                  className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
                />
              </div>
              <div>
                <label className="block text-caption1 text-t-fg2 mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  value={identity.lastName}
                  onChange={(e) => setIdentity((p) => ({ ...p, lastName: e.target.value }))}
                  className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-caption1 text-t-fg2 mb-1">Email *</label>
              <input
                type="email"
                required
                value={identity.email}
                onChange={(e) => setIdentity((p) => ({ ...p, email: e.target.value }))}
                className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-caption1 text-t-fg2 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={identity.phone}
                  onChange={(e) => setIdentity((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
                />
              </div>
              <div>
                <label className="block text-caption1 text-t-fg2 mb-1">École / Formation</label>
                <input
                  type="text"
                  value={identity.school}
                  onChange={(e) => setIdentity((p) => ({ ...p, school: e.target.value }))}
                  className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-caption1 text-t-fg2 mb-1">Lien GitHub</label>
                <input
                  type="url"
                  value={identity.githubUrl}
                  onChange={(e) => setIdentity((p) => ({ ...p, githubUrl: e.target.value }))}
                  placeholder="https://github.com/votre-profil"
                  className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
                />
              </div>
              <div>
                <label className="block text-caption1 text-t-fg2 mb-1">Portfolio</label>
                <input
                  type="url"
                  value={identity.portfolioUrl}
                  onChange={(e) => setIdentity((p) => ({ ...p, portfolioUrl: e.target.value }))}
                  placeholder="https://votre-portfolio.com"
                  className="w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none focus:border-t-stroke-brand"
                />
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={identity.consent}
                onChange={(e) => setIdentity((p) => ({ ...p, consent: e.target.checked }))}
                className="mt-0.5"
              />
              <span className="text-caption1 text-t-fg2">
                J'accepte que mes données soient traitées dans le cadre de ma candidature. *
              </span>
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={identitySubmitting}
                className="inline-flex h-9 items-center gap-2 rounded-fluent bg-t-bg-brand px-4 text-caption1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {identitySubmitting ? 'Enregistrement...' : 'Commencer le questionnaire'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Étape 1+ : questions */}
        {step === 'questions' && (
          <>
            {submitted && (
              <div className="rounded-fluent border border-t-success bg-t-success-bg px-4 py-4 text-t-success">
                <div className="flex items-center gap-2 text-body1 font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  Reponses envoyees avec succes.
                </div>
                <p className="mt-1 text-caption1">Merci, votre candidature a bien ete enregistree.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-fluent border border-t-danger bg-t-danger-bg px-4 py-3 text-caption1 text-t-danger">
                {error}
              </div>
            )}

            {!submitted && currentQuestion && (
              <div className="space-y-4 rounded-fluent-lg border border-t-stroke3 bg-t-bg1 p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-caption2 text-t-fg3">
                    <span>Question {index + 1} / {questions.length}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-t-bg4">
                    <div className="h-full rounded-full bg-t-bg-brand" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div>
                  <h2 className="text-body1 font-semibold text-t-fg1">
                    {currentQuestion.text}
                    {currentQuestion.required && <span className="text-t-danger"> *</span>}
                  </h2>
                  <textarea
                    rows={5}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Votre reponse..."
                    className="mt-3 w-full rounded-fluent border border-t-stroke2 bg-t-bg1 px-3 py-2 text-body1 outline-none transition-colors placeholder:text-t-fg-disabled focus:border-t-stroke-brand"
                  />
                  {questionError && (
                    <p className="mt-2 text-caption1 text-t-danger">{questionError}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIndex((prev) => Math.max(0, prev - 1))}
                    disabled={index === 0 || submitting}
                    className="inline-flex h-8 items-center gap-1 rounded-fluent border border-t-stroke2 px-3 text-caption1 font-semibold text-t-fg2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Precedent
                  </button>

                  {index < questions.length - 1 ? (
                    <button
                      onClick={goToNextQuestion}
                      disabled={submitting}
                      className="inline-flex h-8 items-center gap-1 rounded-fluent bg-t-bg-brand px-3 text-caption1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Suivant <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="inline-flex h-8 items-center gap-1 rounded-fluent bg-t-bg-brand px-3 text-caption1 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Send className="h-4 w-4" /> {submitting ? 'Envoi...' : 'Envoyer mes reponses'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
