import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  GripVertical,
  Trash2,
  Copy,
  Check,
  Link2,
  ChevronDown,
  Settings,
  MessageSquare,
  Eye,
  Bot,
  Send,
  BarChart3,
  FileText,
  Users,
  Upload,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { loadChatbotQuestions, loadRecruitmentData, saveChatbotQuestions } from '../lib/domainApi';
import type { Candidate, ChatbotQuestion, Offer } from '../types';

const questionTemplates = [
  { text: 'Parlez-nous de votre parcours et de votre formation actuelle.', type: 'open' as const },
  { text: 'Pourquoi cette alternance vous interesse-t-elle ?', type: 'open' as const },
  { text: 'Decrivez un projet technique que vous avez realise.', type: 'open' as const },
  { text: 'Quelle est votre disponibilite et votre rythme d\'alternance ?', type: 'open' as const },
  { text: 'Etes-vous eligible a un contrat d\'alternance ?', type: 'boolean' as const },
  { text: 'Quel est votre niveau d\'experience avec les technologies demandees ?', type: 'choice' as const },
];

type View = 'config' | 'preview' | 'stats';

export default function Chatbot() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryJobId = searchParams.get('jobId') || '';
  const [offers, setOffers] = useState<Offer[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [view, setView] = useState<View>('config');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    async function refreshData() {
      setLoading(true);
      try {
        const data = await loadRecruitmentData();
        const activeOffers = data.offers.filter((o) => o.status !== 'cloture');
        setOffers(activeOffers);
        setCandidates(data.candidates);
        setDataError('');
      } catch (err) {
        setDataError(err instanceof Error ? err.message : 'Impossible de charger les donnees du chatbot.');
      } finally {
        setLoading(false);
      }
    }

    refreshData();
  }, []);

  useEffect(() => {
    if (queryJobId && offers.some((o) => o.id === queryJobId)) {
      if (selectedOfferId !== queryJobId) {
        setSelectedOfferId(queryJobId);
      }
      return;
    }

    if (!selectedOfferId && offers.length > 0) {
      setSelectedOfferId(offers[0].id);
    }
  }, [offers, queryJobId, selectedOfferId]);

  const offer = offers.find((o) => o.id === selectedOfferId);

  const [questions, setQuestions] = useState<ChatbotQuestion[]>([]);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [closingMsg, setClosingMsg] = useState('');
  const [savingQuestions, setSavingQuestions] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    async function refreshQuestions() {
      if (!selectedOfferId) {
        setQuestions([]);
        return;
      }

      const loaded = await loadChatbotQuestions(selectedOfferId);
      setQuestions(loaded);
    }

    refreshQuestions();
  }, [selectedOfferId]);

  const offerCandidates = candidates.filter((c) => c.offer_id === selectedOfferId);
  const completed = offerCandidates.filter((c) => c.chatbot_completed).length;

  function selectOffer(id: string) {
    setSelectedOfferId(id);
    setSearchParams({ jobId: id });
  }

  function addQuestion() {
    const newQ: ChatbotQuestion = { id: `q-${Date.now()}`, text: '', type: 'open', required: true, order: questions.length + 1 };
    setQuestions([...questions, newQ]);
  }

  function addFromTemplate(tpl: typeof questionTemplates[number]) {
    const newQ: ChatbotQuestion = { id: `q-${Date.now()}`, text: tpl.text, type: tpl.type, required: true, order: questions.length + 1 };
    setQuestions([...questions, newQ]);
    setShowTemplates(false);
  }

  function updateQuestion(id: string, field: keyof ChatbotQuestion, value: string | boolean) {
    setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  }

  function removeQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  async function handleSaveQuestions() {
    if (!selectedOfferId) return;
    setSavingQuestions(true);
    setSaveError('');
    setSaveMessage('');
    try {
      const saved = await saveChatbotQuestions(selectedOfferId, questions);
      setQuestions(saved);
      setSaveMessage('Questions enregistrees.');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Impossible d\'enregistrer les questions.');
    } finally {
      setSavingQuestions(false);
    }
  }

  async function handleResetQuestions() {
    if (!selectedOfferId) return;
    setSaveError('');
    setSaveMessage('');
    const loaded = await loadChatbotQuestions(selectedOfferId);
    setQuestions(loaded);
  }

  const chatbotUrl = offer ? `${window.location.origin}/apply/${offer.id}` : '';

  function copyLink() {
    navigator.clipboard.writeText(chatbotUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  const viewTabs: { key: View; label: string; icon: typeof Settings }[] = [
    { key: 'config', label: 'Configuration', icon: Settings },
    { key: 'preview', label: 'Apercu', icon: Eye },
    { key: 'stats', label: 'Statistiques', icon: BarChart3 },
  ];

  return (
    <>
      <TopBar title="Chatbot" />
      {dataError && (
        <div className="mx-4 sm:mx-6 mt-3 rounded-fluent border border-t-danger bg-t-danger-bg px-3 py-2 text-caption1 text-t-danger">
          {dataError}
        </div>
      )}
      {loading && (
        <div className="mx-4 sm:mx-6 mt-3 rounded-fluent border border-t-stroke3 bg-t-bg1 px-3 py-2 text-caption1 text-t-fg3">
          Chargement des offres...
        </div>
      )}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Mobile offer selector */}
        <div className="md:hidden px-3 py-2 bg-t-bg2 border-b border-t-stroke3 shrink-0">
          <select
            value={selectedOfferId}
            onChange={(e) => selectOffer(e.target.value)}
            className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent text-t-fg1 outline-none"
          >
            {offers.map((o) => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>

        {/* Left panel - desktop only */}
        <div className="hidden md:flex w-[240px] shrink-0 border-r border-t-stroke2 flex-col bg-t-bg2">
          <div className="px-3 py-3 border-b border-t-stroke3 shrink-0">
            <h2 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">Offres</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {offers.map((o) => {
              const count = candidates.filter((c) => c.offer_id === o.id).length;
              return (
                <button
                  key={o.id}
                  onClick={() => selectOffer(o.id)}
                  className={`w-full text-left px-3 py-3 border-l-[3px] transition-colors ${
                    selectedOfferId === o.id ? 'bg-t-bg-subtle-selected border-l-t-stroke-brand' : 'hover:bg-t-bg-subtle-hover border-l-transparent'
                  }`}
                >
                  <p className={`text-body1 truncate ${selectedOfferId === o.id ? 'font-semibold' : ''} text-t-fg1`}>{o.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-caption2 text-t-fg3">{count} candidats</span>
                    {questions.length > 0 && selectedOfferId === o.id && (
                      <span className="px-1 py-px text-caption2 bg-t-success-bg text-t-success rounded-sm">Configure</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {offer && (
            <>
              {/* View tabs */}
              <div className="flex items-center border-b border-t-stroke2 bg-t-bg1 px-4 sm:px-6 shrink-0 overflow-x-auto">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setView(tab.key)}
                    className={`px-3 py-3 text-caption1 font-semibold border-b-2 transition-colors inline-flex items-center gap-1.5 ${
                      view === tab.key ? 'border-t-stroke-brand text-t-fg-brand' : 'border-transparent text-t-fg3 hover:text-t-fg2'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />{tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto bg-t-bg3">
                {view === 'config' && (
                  <div className="max-w-[700px] mx-auto px-3 sm:px-6 py-5 space-y-4">
                    {/* URL */}
                    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                      <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">
                        <Link2 className="w-3.5 h-3.5 text-t-fg3" />Lien de candidature
                      </h3>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-caption1 text-t-fg2 bg-t-bg3 px-3 py-1.5 rounded-fluent border border-t-stroke3 truncate">{chatbotUrl}</code>
                        <button onClick={copyLink} className="h-7 px-3 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover inline-flex items-center gap-1 transition-colors shrink-0">
                          {copiedUrl ? <><Check className="w-3 h-3 text-t-success" />Copie</> : <><Copy className="w-3 h-3" />Copier</>}
                        </button>
                      </div>
                      <p className="text-caption2 text-t-fg3 mt-2">Integrez ce lien dans vos annonces. Chaque candidat accede automatiquement au chatbot lie a cette offre.</p>
                    </div>

                    {/* Messages */}
                    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                      <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">
                        <MessageSquare className="w-3.5 h-3.5 text-t-fg3" />Messages
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Message d'accueil</label>
                          <textarea rows={2} value={welcomeMsg} onChange={(e) => setWelcomeMsg(e.target.value)}
                            className="w-full px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
                            placeholder="Message affiche au debut..." />
                        </div>
                        <div>
                          <label className="block text-caption1 font-semibold text-t-fg2 mb-1">Message de fin</label>
                          <textarea rows={2} value={closingMsg} onChange={(e) => setClosingMsg(e.target.value)}
                            className="w-full px-3 py-2 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors resize-none placeholder:text-t-fg-disabled"
                            placeholder="Message apres la derniere question..." />
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="inline-flex items-center gap-2 text-caption1 font-semibold text-t-fg2 uppercase tracking-wider">
                          <MessageSquare className="w-3.5 h-3.5 text-t-fg3" />Questions ({questions.length})
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <button onClick={() => setShowTemplates(!showTemplates)} className="h-7 px-2.5 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 hover:bg-t-bg1-hover rounded-fluent inline-flex items-center gap-1 transition-colors">
                              <FileText className="w-3.5 h-3.5" />Modeles
                            </button>
                            {showTemplates && (
                              <div className="absolute right-0 top-full mt-1 w-[calc(100vw-2rem)] sm:w-[360px] bg-t-bg1 border border-t-stroke2 rounded-fluent shadow-lg z-20 py-1 max-h-[300px] overflow-y-auto">
                                {questionTemplates.map((tpl, i) => (
                                  <button key={i} onClick={() => addFromTemplate(tpl)} className="w-full text-left px-3 py-2 text-caption1 text-t-fg1 hover:bg-t-bg-subtle-hover transition-colors">
                                    <span className="px-1 py-px text-caption2 bg-t-bg4 text-t-fg3 rounded-sm mr-1.5">{tpl.type}</span>
                                    {tpl.text}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={addQuestion} className="h-7 px-2.5 text-caption1 font-semibold text-t-fg-brand hover:bg-t-brand-160 rounded-fluent inline-flex items-center gap-1 transition-colors">
                            <Plus className="w-3.5 h-3.5" />Ajouter
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {questions.map((q, i) => (
                          <div key={q.id} className="flex items-start gap-2 bg-t-bg2 rounded-fluent px-3 py-3 border border-t-stroke3">
                            <GripVertical className="w-4 h-4 text-t-fg-disabled mt-1.5 shrink-0 cursor-grab" />
                            <span className="w-5 h-5 rounded-full bg-t-bg4 flex items-center justify-center text-caption2 font-semibold text-t-fg3 shrink-0 mt-1">{i + 1}</span>
                            <div className="flex-1 space-y-2">
                              <input type="text" value={q.text} onChange={(e) => updateQuestion(q.id, 'text', e.target.value)} placeholder="Texte de la question..."
                                className="w-full h-8 px-3 text-body1 bg-t-bg1 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors placeholder:text-t-fg-disabled" />
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <select value={q.type} onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                    className="appearance-none h-6 pl-2 pr-6 text-caption2 bg-t-bg1 border border-t-stroke2 rounded-fluent text-t-fg2 outline-none cursor-pointer">
                                    <option value="open">Ouverte</option>
                                    <option value="choice">Choix</option>
                                    <option value="url">URL</option>
                                    <option value="boolean">Oui/Non</option>
                                    <option value="file">Fichier</option>
                                  </select>
                                  <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-t-fg3 pointer-events-none" />
                                </div>
                                <label className="inline-flex items-center gap-1.5 text-caption2 text-t-fg2 cursor-pointer">
                                  <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)}
                                    className="w-3.5 h-3.5 rounded border-t-stroke2 text-t-brand-80" />
                                  Obligatoire
                                </label>
                              </div>
                            </div>
                            <button onClick={() => removeQuestion(q.id)} className="w-7 h-7 flex items-center justify-center rounded-fluent text-t-fg-disabled hover:text-t-danger hover:bg-t-danger-bg transition-colors shrink-0 mt-0.5">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {questions.length === 0 && (
                          <div className="text-center py-8 text-caption1 text-t-fg3">Aucune question. Utilisez les modeles ou cliquez "Ajouter".</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleResetQuestions}
                        className="h-8 px-4 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover transition-colors"
                      >
                        Reinitialiser
                      </button>
                      <button
                        onClick={handleSaveQuestions}
                        disabled={savingQuestions}
                        className="h-8 px-4 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-50 rounded-fluent transition-colors"
                      >
                        {savingQuestions ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                    {saveMessage && (
                      <div className="rounded-fluent border border-t-success bg-t-success-bg px-3 py-2 text-caption1 text-t-success">
                        {saveMessage}
                      </div>
                    )}
                    {saveError && (
                      <div className="rounded-fluent border border-t-danger bg-t-danger-bg px-3 py-2 text-caption1 text-t-danger">
                        {saveError}
                      </div>
                    )}
                  </div>
                )}

                {view === 'preview' && (
                  <div className="max-w-[480px] mx-auto px-3 sm:px-6 py-5">
                    <div className="bg-t-bg1 border border-t-stroke2 rounded-fluent-lg shadow-lg overflow-hidden">
                      {/* Chat header */}
                      <div className="bg-t-brand-80 px-4 py-3 flex items-center gap-3">
                        <Bot className="w-5 h-5 text-white" />
                        <div>
                          <p className="text-body1 font-semibold text-white">{offer.title}</p>
                          <p className="text-caption2 text-white/70">Chatbot de prequalification</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-caption2 text-white/70">En ligne</span>
                        </div>
                      </div>
                      {/* Messages */}
                      <div className="p-4 space-y-3 min-h-[400px] max-h-[520px] overflow-y-auto bg-t-bg2">
                        {/* Welcome */}
                        {welcomeMsg && (
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-t-brand-160 flex items-center justify-center shrink-0">
                              <Bot className="w-3 h-3 text-t-brand-80" />
                            </div>
                            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                              <p className="text-body1 text-t-fg1">{welcomeMsg}</p>
                              <span className="text-caption2 text-t-fg-disabled block mt-1">14:00</span>
                            </div>
                          </div>
                        )}
                        {/* Questions with simulated answers */}
                        {questions.map((q, i) => {
                          const sampleAnswers: Record<string, string> = {
                            open: 'Je suis en 3eme annee de BUT Informatique. J\'ai fait un stage de 3 mois chez une startup ou j\'ai travaille sur du React/Node.',
                            url: 'https://github.com/candidat-exemple',
                            boolean: 'Oui',
                            choice: 'Intermediaire (1-2 ans)',
                          };
                          const isFile = q.type === 'file';
                          const answer = isFile ? null : (sampleAnswers[q.type] || 'Reponse du candidat...');
                          const timeBase = 14;
                          const mins = (i + 1) * 2;
                          const timeStr = `${timeBase}:${String(mins).padStart(2, '0')}`;

                          return (
                            <div key={q.id}>
                              {/* Bot question */}
                              <div className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-t-brand-160 flex items-center justify-center shrink-0">
                                  <Bot className="w-3 h-3 text-t-brand-80" />
                                </div>
                                <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                                  <p className="text-body1 text-t-fg1">{q.text || `Question ${i + 1}`}</p>
                                  {q.type === 'boolean' && (
                                    <div className="flex gap-2 mt-2">
                                      <span className="px-3 py-1 text-caption1 bg-t-bg-brand-selected text-t-fg-brand rounded-full border border-t-brand-140 font-medium">Oui</span>
                                      <span className="px-3 py-1 text-caption1 bg-t-bg3 text-t-fg3 rounded-full border border-t-stroke3">Non</span>
                                    </div>
                                  )}
                                  {q.type === 'choice' && (
                                    <div className="flex flex-col gap-1.5 mt-2">
                                      {['Debutant (< 1 an)', 'Intermediaire (1-2 ans)', 'Avance (2+ ans)'].map((opt) => (
                                        <span key={opt} className={`px-3 py-1 text-caption1 rounded-full border ${opt === 'Intermediaire (1-2 ans)' ? 'bg-t-bg-brand-selected text-t-fg-brand border-t-brand-140 font-medium' : 'bg-t-bg3 text-t-fg3 border-t-stroke3'}`}>{opt}</span>
                                      ))}
                                    </div>
                                  )}
                                  {isFile && (
                                    <div className="mt-2 p-3 border border-dashed border-t-stroke1 rounded-fluent bg-t-bg3 text-center">
                                      <Upload className="w-5 h-5 mx-auto text-t-fg3 mb-1" />
                                      <p className="text-caption1 text-t-fg3">Glissez votre fichier ou cliquez</p>
                                      <p className="text-caption2 text-t-fg-disabled mt-0.5">PDF, DOC, DOCX (max 10 Mo)</p>
                                    </div>
                                  )}
                                  {q.required && <span className="text-caption2 text-t-danger mt-1 block">* Obligatoire</span>}
                                  <span className="text-caption2 text-t-fg-disabled block mt-1">{timeStr}</span>
                                </div>
                              </div>
                              {/* Candidate answer */}
                              <div className="flex justify-end mt-2">
                                {isFile ? (
                                  <div className="bg-t-brand-160 border border-t-brand-140 rounded-fluent rounded-tr-none px-3 py-2 max-w-[70%] shadow-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-fluent bg-t-brand-80/10 flex items-center justify-center shrink-0">
                                        <Paperclip className="w-3.5 h-3.5 text-t-brand-80" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-caption1 font-medium text-t-fg1 truncate">CV_Candidat.pdf</p>
                                        <p className="text-caption2 text-t-fg3">245 Ko</p>
                                      </div>
                                      <CheckCircle2 className="w-4 h-4 text-t-success shrink-0" />
                                    </div>
                                    <span className="text-caption2 text-t-fg-disabled block mt-1 text-right">{timeStr}</span>
                                  </div>
                                ) : (
                                  <div className="bg-t-brand-160 border border-t-brand-140 rounded-fluent rounded-tr-none px-3 py-2 max-w-[70%] shadow-sm">
                                    <p className="text-body1 text-t-fg1">{answer}</p>
                                    <span className="text-caption2 text-t-fg-disabled block mt-1 text-right">{timeStr}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* Closing */}
                        {closingMsg && (
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-t-brand-160 flex items-center justify-center shrink-0">
                              <Bot className="w-3 h-3 text-t-brand-80" />
                            </div>
                            <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                              <p className="text-body1 text-t-fg1">{closingMsg}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-t-success" />
                                <span className="text-caption2 text-t-success font-medium">Questionnaire termine</span>
                              </div>
                              <span className="text-caption2 text-t-fg-disabled block mt-1">14:{String(questions.length * 2 + 2).padStart(2, '0')}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Input */}
                      <div className="border-t border-t-stroke2 px-3 py-2 flex items-center gap-2 bg-t-bg1">
                        <button disabled className="w-8 h-8 rounded-fluent flex items-center justify-center text-t-fg-disabled hover:bg-t-bg3 transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <input type="text" disabled placeholder="Tapez votre reponse..." className="flex-1 h-8 px-3 text-body1 bg-t-bg3 border border-t-stroke2 rounded-fluent text-t-fg-disabled" />
                        <button disabled className="w-8 h-8 rounded-fluent bg-t-bg4 flex items-center justify-center text-t-fg-disabled">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-center text-caption2 text-t-fg3 mt-3">Apercu du chatbot tel que le candidat le verra</p>
                  </div>
                )}

                {view === 'stats' && (
                  <div className="max-w-[700px] mx-auto px-3 sm:px-6 py-5 space-y-4">
                    {/* KPI */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'Candidats', value: offerCandidates.length, icon: Users },
                        { label: 'Completes', value: completed, icon: Check },
                        { label: 'Taux completion', value: offerCandidates.length > 0 ? `${Math.round((completed / offerCandidates.length) * 100)}%` : '0%', icon: BarChart3 },
                        { label: 'Questions', value: questions.length, icon: MessageSquare },
                      ].map((s) => (
                        <div key={s.label} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <s.icon className="w-[14px] h-[14px] text-t-fg3" strokeWidth={1.5} />
                            <span className="text-caption1 text-t-fg3">{s.label}</span>
                          </div>
                          <span className="text-subtitle1 font-semibold text-t-fg1">{s.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Distribution */}
                    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                      <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Repartition par categorie de tri</h3>
                      {(['prioritaire', 'a_examiner', 'a_revoir', 'a_ecarter'] as const).map((cat) => {
                        const count = offerCandidates.filter((c) => c.tri_category === cat).length;
                        const pct = offerCandidates.length > 0 ? (count / offerCandidates.length) * 100 : 0;
                        const colors: Record<string, string> = { prioritaire: 'bg-t-success', a_examiner: 'bg-t-brand-80', a_revoir: 'bg-t-warning', a_ecarter: 'bg-t-danger' };
                        const labels: Record<string, string> = { prioritaire: 'Prioritaires', a_examiner: 'A examiner', a_revoir: 'A revoir', a_ecarter: 'Ecartes' };
                        return (
                          <div key={cat} className="flex items-center gap-3 mb-2 last:mb-0">
                            <span className="text-caption1 text-t-fg2 w-24">{labels[cat]}</span>
                            <div className="flex-1 h-2 bg-t-bg3 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${colors[cat]} transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-caption1 text-t-fg3 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Recent responses */}
                    <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
                      <h3 className="text-caption1 font-semibold text-t-fg2 uppercase tracking-wider mb-3">Derniers candidats</h3>
                      {offerCandidates.length > 0 ? offerCandidates.slice(0, 5).map((c) => (
                        <div key={c.id} className="flex items-center gap-3 py-2 border-b border-t-stroke3 last:border-b-0">
                          <div className="w-7 h-7 rounded-full bg-t-brand-160 flex items-center justify-center text-caption2 font-semibold text-t-brand-80">{c.first_name[0]}{c.last_name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-body1 text-t-fg1 truncate">{c.first_name} {c.last_name}</p>
                          </div>
                          <span className={`px-1.5 py-px text-caption2 font-medium rounded-sm ${c.chatbot_completed ? 'bg-t-success-bg text-t-success' : 'bg-t-bg4 text-t-fg3'}`}>
                            {c.chatbot_completed ? 'Termine' : 'Incomplet'}
                          </span>
                        </div>
                      )) : (
                        <p className="text-caption1 text-t-fg3 text-center py-4">Aucun candidat pour cette offre</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {!offer && (
            <div className="flex-1 flex items-center justify-center bg-t-bg3 text-body1 text-t-fg3">
              Selectionnez une offre
            </div>
          )}
        </div>
      </div>
    </>
  );
}
