import { Link } from 'react-router-dom';
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  Users,
  Briefcase,
  BarChart3,
  Shield,
  Zap,
  Filter,
} from 'lucide-react';

const features = [
  { icon: Bot, title: 'Chatbot de prequalification', desc: 'Questions identiques pour chaque candidat, adaptees a chaque offre. Collecte structuree et equitable.' },
  { icon: Filter, title: 'Filtrage sans scoring', desc: 'Grille de criteres explicites, pas de note opaque. Le recruteur garde le controle de la decision finale.' },
  { icon: Users, title: 'Fiches synthetiques', desc: 'Chaque candidature est transformee en une fiche standardisee, lisible en 30 secondes.' },
  { icon: Briefcase, title: 'Gestion des offres', desc: 'Creez vos offres, generez un lien de candidature unique, et suivez chaque poste en temps reel.' },
  { icon: BarChart3, title: 'Vivier de talents', desc: 'Conservez les profils non retenus pour les reactiver sur de futures opportunites.' },
  { icon: Shield, title: 'Transparence totale', desc: 'Chaque decision est tracable. Les criteres de filtrage sont visibles et explicables.' },
];

const steps = [
  { num: '1', title: 'Creez votre offre', desc: 'Definissez le poste, le contexte, les missions et les criteres.' },
  { num: '2', title: 'Configurez le chatbot', desc: 'Personnalisez les questions adaptees au profil recherche.' },
  { num: '3', title: 'Diffusez le lien', desc: 'Integrez le lien unique dans vos annonces ou jobboards.' },
  { num: '4', title: 'Triez en toute clarte', desc: 'Recevez des fiches structurees et prenez vos decisions.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-t-bg1 text-t-fg1 font-sans">
      {/* Nav */}
      <nav className="h-16 border-b border-t-stroke3 flex items-center justify-between px-4 sm:px-8 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-fluent bg-t-brand-80 flex items-center justify-center">
            <span className="text-white text-caption1 font-bold">FD</span>
          </div>
          <span className="text-subtitle2 font-semibold text-t-fg1">FinDem</span>
        </div>
        <Link to="/login" className="h-8 px-4 text-caption1 font-semibold text-t-fg2 border border-t-stroke2 rounded-fluent hover:bg-t-bg1-hover inline-flex items-center transition-colors">
          Se connecter
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-t-brand-160 rounded-full text-caption1 font-semibold text-t-brand-80 mb-6">
          <Zap className="w-3.5 h-3.5" />
          Assistant de prequalification pour alternants IT
        </div>
        <h1 className="text-2xl sm:text-[32px] sm:leading-[42px] lg:text-[40px] lg:leading-[52px] font-semibold text-t-fg1 max-w-[720px] mx-auto">
          Triez vos candidatures d'alternance sans scoring opaque
        </h1>
        <p className="text-subtitle2 text-t-fg3 mt-4 max-w-[560px] mx-auto leading-relaxed">
          Un chatbot structure les reponses des candidats. Vous recevez des fiches synthetiques exploitables. La decision reste humaine.
        </p>
        <div className="flex items-center justify-center mt-8">
          <Link to="/register" className="h-10 px-6 text-body1 font-semibold text-white bg-t-bg-brand hover:bg-t-bg-brand-hover rounded-fluent inline-flex items-center gap-2 transition-colors">
            Commencer gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Preview */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-8 pb-12 sm:pb-20">
        <div className="bg-t-bg3 border border-t-stroke2 rounded-fluent-lg p-1">
          <div className="bg-t-bg-static rounded-fluent overflow-hidden">
            <div className="h-8 flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-t-danger opacity-70" />
              <div className="w-3 h-3 rounded-full bg-t-warning opacity-70" />
              <div className="w-3 h-3 rounded-full bg-t-success opacity-70" />
            </div>
            <div className="bg-t-bg3 h-[200px] sm:h-[360px] flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4">
                  <div className="w-16 h-16 rounded-fluent-lg bg-t-brand-160 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-t-brand-80" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-t-fg-disabled" />
                  <div className="w-16 h-16 rounded-fluent-lg bg-t-success-bg flex items-center justify-center">
                    <Filter className="w-8 h-8 text-t-success" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-t-fg-disabled" />
                  <div className="w-16 h-16 rounded-fluent-lg bg-t-bg4 flex items-center justify-center">
                    <Users className="w-8 h-8 text-t-fg2" />
                  </div>
                </div>
                <p className="text-body1 text-t-fg3">Chatbot → Filtrage → Fiches recruteur</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-t-bg2 border-t border-t-stroke3 py-12 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <h2 className="text-title3 font-semibold text-t-fg1 text-center mb-2">Tout ce dont vous avez besoin</h2>
          <p className="text-body1 text-t-fg3 text-center mb-12 max-w-[480px] mx-auto">Un outil complet pour structurer, qualifier et organiser vos candidatures d'alternants IT.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-t-bg1 border border-t-stroke3 rounded-fluent px-5 py-5">
                <f.icon className="w-6 h-6 text-t-brand-80 mb-3" strokeWidth={1.5} />
                <h3 className="text-body1 font-semibold text-t-fg1 mb-1">{f.title}</h3>
                <p className="text-caption1 text-t-fg3 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
          <h2 className="text-title3 font-semibold text-t-fg1 text-center mb-8 sm:mb-12">Comment ca fonctionne</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-t-brand-80 text-white text-body1 font-semibold flex items-center justify-center mx-auto mb-3">
                  {s.num}
                </div>
                <h3 className="text-body1 font-semibold text-t-fg1 mb-1">{s.title}</h3>
                <p className="text-caption1 text-t-fg3">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-t-brand-10 py-12 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-title3 font-semibold text-white mb-3">Pret a structurer vos recrutements ?</h2>
          <p className="text-body1 text-t-brand-120 mb-6">Creez votre premier chatbot en quelques minutes.</p>
          <Link to="/register" className="h-10 px-6 text-body1 font-semibold text-t-brand-10 bg-white hover:bg-t-bg2 rounded-fluent inline-flex items-center gap-2 transition-colors">
            Commencer maintenant <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-t-stroke3 py-6 sm:py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-t-brand-80 flex items-center justify-center">
              <span className="text-white text-caption2 font-bold">FD</span>
            </div>
            <span className="text-caption1 text-t-fg3">FinDem</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-caption1 text-t-fg3">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-t-success" />Donnees securisees</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-t-success" />Human-in-the-loop</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-t-success" />Sans scoring opaque</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
