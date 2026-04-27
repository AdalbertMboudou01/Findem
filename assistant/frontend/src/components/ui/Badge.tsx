import type { TriCategory, CandidateStatus, OfferStatus } from '../../types';

const triConfig: Record<TriCategory, { label: string; dot: string }> = {
  prioritaire: { label: 'Prioritaire', dot: 'bg-t-success' },
  a_examiner: { label: 'A examiner', dot: 'bg-t-brand-80' },
  a_revoir: { label: 'A revoir', dot: 'bg-t-warning' },
  a_ecarter: { label: 'Ecarte', dot: 'bg-t-danger' },
};

const statusConfig: Record<CandidateStatus, { label: string; bg: string; text: string }> = {
  retenu_entretien: { label: 'Retenu', bg: 'bg-t-success-bg', text: 'text-t-success' },
  a_revoir_manuellement: { label: 'A revoir', bg: 'bg-t-warning-bg', text: 'text-t-warning' },
  non_retenu: { label: 'Non retenu', bg: 'bg-t-danger-bg', text: 'text-t-danger' },
  vivier: { label: 'A revoir', bg: 'bg-t-warning-bg', text: 'text-t-warning' },
  en_attente: { label: 'En attente', bg: 'bg-t-bg4', text: 'text-t-fg3' },
};

const offerStatusConfig: Record<OfferStatus, { label: string; bg: string; text: string }> = {
  ouvert: { label: 'Ouvert', bg: 'bg-t-success-bg', text: 'text-t-success' },
  cloture: { label: 'Clôturée', bg: 'bg-t-danger-bg', text: 'text-t-danger' },
};

export function TriBadge({ category }: { category: TriCategory }) {
  const c = triConfig[category];
  return (
    <span className="inline-flex items-center gap-1.5 text-caption1 text-t-fg2">
      <span className={`w-[6px] h-[6px] rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: CandidateStatus }) {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-1.5 py-px text-caption2 font-medium rounded-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const c = offerStatusConfig[status];
  return (
    <span className={`inline-flex items-center px-1.5 py-px text-caption2 font-medium rounded-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
