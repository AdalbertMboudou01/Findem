import React, { useEffect, useState } from 'react';
import { ThumbsUp, Minus, ThumbsDown, CheckCircle2, AlertTriangle, ChevronDown, FileText, PenTool, Clock, CheckCircle } from 'lucide-react';
import { addDecisionInput, loadApplicationDecision, recordFinalDecision } from '../lib/domainApi';
import type { ApplicationDecision } from '../types';

type Props = { applicationId: string };

const SENTIMENT_CONFIG = {
  FAVORABLE: { label: 'Favorable', icon: ThumbsUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  RESERVE: { label: 'Réservé', icon: Minus, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  DEFAVORABLE: { label: 'Défavorable', icon: ThumbsDown, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
} as const;

type Sentiment = keyof typeof SENTIMENT_CONFIG;

function formatDateTime(dt: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dt));
}

export default function DecisionSection({ applicationId }: Props) {
  const [decision, setDecision] = useState<ApplicationDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formulaire avis
  const [showInputForm, setShowInputForm] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment>('FAVORABLE');
  const [comment, setComment] = useState('');
  const [confidence, setConfidence] = useState(3);
  const [submittingInput, setSubmittingInput] = useState(false);

  // Formulaire décision finale
  const [showFinalForm, setShowFinalForm] = useState(false);
  const [finalStatus, setFinalStatus] = useState('RETENU');
  const [rationale, setRationale] = useState('');
  const [submittingFinal, setSubmittingFinal] = useState(false);

  // Signature de contrat
  const [showContractForm, setShowContractForm] = useState(false);
  const [contractUrl, setContractUrl] = useState('');
  const [contractNotes, setContractNotes] = useState('');
  const [submittingContract, setSubmittingContract] = useState(false);
  const [contractStatus, setContractStatus] = useState<'PENDING' | 'SIGNED' | 'EXPIRED' | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadApplicationDecision(applicationId)
      .then((d) => { if (mounted) { setDecision(d); setLoading(false); } })
      .catch((e) => { if (mounted) { setError(e.message); setLoading(false); } });
    return () => { mounted = false; };
  }, [applicationId]);

  async function handleAddInput(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingInput(true);
    setError('');
    try {
      const input = await addDecisionInput(applicationId, { sentiment, comment: comment.trim() || undefined, confidence });
      setDecision((prev) => prev ? { ...prev, inputs: [...prev.inputs, input] } : prev);
      setComment('');
      setConfidence(3);
      setShowInputForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'enregistrer l\'avis.');
    } finally {
      setSubmittingInput(false);
    }
  }

  async function handleFinalDecision(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingFinal(true);
    setError('');
    try {
      await recordFinalDecision(applicationId, finalStatus, rationale);
      const updated = await loadApplicationDecision(applicationId);
      setDecision(updated);
      setShowFinalForm(false);
      setRationale('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmittingFinal(false);
    }
  }

  async function handleContractSignature(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingContract(true);
    setError('');
    try {
      const response = await fetch('/api/contract-signatures/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('assistant.token')}`
        },
        body: JSON.stringify({
          applicationId: applicationId,
          contractUrl: contractUrl,
          notes: contractNotes
        })
      });

      if (response.ok) {
        setContractStatus('PENDING');
        setShowContractForm(false);
        setContractUrl('');
        setContractNotes('');
      } else {
        setError('Erreur lors de la préparation du contrat');
      }
    } catch (e) {
      setError('Erreur lors de la préparation du contrat');
    } finally {
      setSubmittingContract(false);
    }
  }

  if (loading) return <div className="text-center py-8 text-caption1 text-t-fg3">Chargement…</div>;

  const inputs = decision?.inputs ?? [];
  const hasFinal = !!decision?.id;

  return (
    <div className="space-y-4">
      {/* Erreur */}
      {error && (
        <div className="px-3 py-2 text-caption1 text-t-danger bg-t-danger-bg border border-t-danger rounded-fluent">
          {error}
        </div>
      )}

      {/* Blocage */}
      {decision?.blocking_reason && !hasFinal && (
        <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-fluent">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-caption1 text-amber-700">{decision.blocking_reason}</p>
        </div>
      )}

      {/* Décision finale */}
      {hasFinal && decision && (
        <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-t-success" />
            <span className="text-caption1 font-semibold text-t-fg1">Décision finale : {decision.final_status}</span>
          </div>
          {decision.rationale && <p className="text-body1 text-t-fg2 mt-1">{decision.rationale}</p>}
          {decision.decided_at && (
            <p className="text-caption2 text-t-fg3 mt-1">{formatDateTime(decision.decided_at)}</p>
          )}
        </div>
      )}

      {/* Liste des avis */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-caption1 font-semibold text-t-fg2">
            Avis {inputs.length > 0 && <span className="text-t-fg3 font-normal">({inputs.length})</span>}
          </h3>
          {!showInputForm && (
            <button
              onClick={() => setShowInputForm(true)}
              className="text-caption1 font-medium text-t-brand-80 hover:text-t-brand-60 transition-colors"
            >
              + Donner mon avis
            </button>
          )}
        </div>

        {inputs.length === 0 && !showInputForm && (
          <p className="text-center py-6 text-caption1 text-t-fg3">Aucun avis pour le moment</p>
        )}

        {inputs.map((inp) => {
          const cfg = SENTIMENT_CONFIG[inp.sentiment as Sentiment];
          const Icon = cfg.icon;
          return (
            <div key={inp.id} className={`border rounded-fluent px-4 py-3 ${cfg.bg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-caption1 font-semibold ${cfg.color}`}>{cfg.label}</span>
                {inp.confidence != null && (
                  <span className="text-caption2 text-t-fg3">Confiance : {inp.confidence}/5</span>
                )}
                <span className="ml-auto text-caption2 text-t-fg3">{formatDateTime(inp.created_at)}</span>
              </div>
              {inp.comment && <p className="text-body1 text-t-fg2 mt-1">{inp.comment}</p>}
            </div>
          );
        })}
      </div>

      {/* Formulaire avis */}
      {showInputForm && (
        <form onSubmit={handleAddInput} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4 space-y-3">
          <div className="flex gap-2">
            {(Object.keys(SENTIMENT_CONFIG) as Sentiment[]).map((s) => {
              const cfg = SENTIMENT_CONFIG[s];
              const Icon = cfg.icon;
              return (
                <button key={s} type="button"
                  onClick={() => setSentiment(s)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-fluent border text-caption1 font-medium transition-colors ${sentiment === s ? cfg.bg + ' ' + cfg.color : 'bg-t-bg2 border-t-stroke2 text-t-fg3'}`}
                >
                  <Icon className="w-3.5 h-3.5" />{cfg.label}
                </button>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Commentaire (optionnel)…"
            className="w-full px-3 py-2 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand resize-none transition-colors"
          />
          <div className="flex items-center gap-2">
            <span className="text-caption1 text-t-fg3 shrink-0">Confiance :</span>
            {[1,2,3,4,5].map((v) => (
              <button key={v} type="button"
                onClick={() => setConfidence(v)}
                className={`w-7 h-7 rounded-full text-caption1 font-semibold transition-colors ${confidence === v ? 'bg-t-bg-brand text-white' : 'bg-t-bg2 text-t-fg3 hover:bg-t-bg1-hover'}`}
              >{v}</button>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowInputForm(false)}
              className="px-3 py-1.5 text-caption1 text-t-fg2 hover:bg-t-bg1-hover rounded-fluent transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submittingInput}
              className="px-3 py-1.5 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent transition-colors">
              {submittingInput ? 'Envoi…' : 'Soumettre'}
            </button>
          </div>
        </form>
      )}

      {/* Bouton décision finale */}
      {!hasFinal && inputs.length > 0 && !showFinalForm && (
        <button
          onClick={() => setShowFinalForm(true)}
          className="w-full py-2 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover rounded-fluent transition-colors"
        >
          Trancher — enregistrer la décision finale
        </button>
      )}

      {/* Formulaire décision finale */}
      {showFinalForm && (
        <form onSubmit={handleFinalDecision} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4 space-y-3">
          <h3 className="text-caption1 font-semibold text-t-fg1">Décision finale</h3>
          <div className="relative">
            <select value={finalStatus} onChange={(e) => setFinalStatus(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-8 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand transition-colors">
              <option value="RETENU">Retenu</option>
              <option value="NON_RETENU">Non retenu</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VIVIER">Mise en vivier</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-t-fg3 pointer-events-none" />
          </div>
          <textarea value={rationale} onChange={(e) => setRationale(e.target.value)}
            rows={3} placeholder="Motif de la décision (optionnel)…"
            className="w-full px-3 py-2 text-body1 bg-t-bg2 border border-t-stroke2 rounded-fluent outline-none focus:border-t-stroke-brand resize-none transition-colors"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowFinalForm(false)}
              className="px-3 py-1.5 text-caption1 text-t-fg2 hover:bg-t-bg1-hover rounded-fluent transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submittingFinal}
              className="px-3 py-1.5 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent transition-colors">
              {submittingFinal ? 'Enregistrement…' : 'Confirmer la décision'}
            </button>
          </div>
        </form>
      )}

      {/* Signature de contrat */}
      {hasFinal && finalStatus === 'RETENU' && (
        <div className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-caption1 font-semibold text-t-fg1 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Signature de contrat
            </h3>
            {contractStatus === 'SIGNED' && (
              <span className="flex items-center gap-1 text-caption2 text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Signé
              </span>
            )}
            {contractStatus === 'PENDING' && (
              <span className="flex items-center gap-1 text-caption2 text-amber-600">
                <Clock className="w-3.5 h-3.5" />
                En attente
              </span>
            )}
          </div>

          {!showContractForm && contractStatus !== 'SIGNED' && (
            <button
              onClick={() => setShowContractForm(true)}
              className="w-full py-2 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover rounded-fluent transition-colors flex items-center justify-center gap-2"
            >
              <PenTool className="w-4 h-4" />
              Préparer la signature
            </button>
          )}

          {showContractForm && (
            <form onSubmit={handleContractSignature} className="space-y-3">
              <div>
                <label className="block text-caption1 font-medium text-t-fg2 mb-2">URL du contrat</label>
                <input
                  type="url"
                  value={contractUrl}
                  onChange={(e) => setContractUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand"
                  placeholder="https://contrat.entreprise.com/document.pdf"
                />
              </div>

              <div>
                <label className="block text-caption1 font-medium text-t-fg2 mb-2">Notes internes (optionnel)</label>
                <textarea
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-t-stroke2 rounded-fluent bg-t-bg2 text-t-fg1 focus:outline-none focus:ring-2 focus:ring-t-stroke-brand focus:border-t-stroke-brand resize-none"
                  placeholder="Notes pour l'équipe..."
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowContractForm(false)}
                  className="px-3 py-1.5 text-caption1 text-t-fg2 hover:bg-t-bg1-hover rounded-fluent transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingContract}
                  className="px-3 py-1.5 text-caption1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover disabled:opacity-40 rounded-fluent transition-colors"
                >
                  {submittingContract ? 'Préparation…' : 'Préparer la signature'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
