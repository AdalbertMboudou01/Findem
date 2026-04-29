# 🗺️ FINDEM — Roadmap Produit
> Document de référence : ce qui est fait, ce qui reste à faire pour un produit vendable.

---

## 📊 État global : **89% complet**

---

## ✅ A. ENTREPRISE

| Tâche | Statut | Notes |
|-------|--------|-------|
| Création entreprise / onboarding | ✅ Complet | `CompanyOnboarding.tsx` + `/api/companies` |
| Gestion des services/départements (CRUD) | ✅ Complet | `Entreprise.tsx` tab Services |
| Invitation et gestion des membres | ✅ Complet | Email d'invitation + acceptation |
| Rôle ADMIN | ✅ Complet | Vérifié dans backend + frontend |
| Rôle RECRUITER | ✅ Complet | Vérifié dans backend + frontend |
| Rôle HIRING_MANAGER | ⚠️ Partiel | Stocké en DB, pas de permissions distinctes |
| Rôle OBSERVER | ⚠️ Partiel | Stocké en DB, pas de restrictions UI |

---

## ✅ B. OFFRES

| Tâche | Statut | Notes |
|-------|--------|-------|
| CRUD offres d'emploi | ✅ Complet | `Offers.tsx` |
| Configuration avancée (quota, critères, technologies) | ✅ Complet | `OfferSettings.tsx` |
| Lien public chatbot par offre | ✅ Complet | `/apply/:jobId` public |
| Statut ouvert/fermé | ✅ Complet | Manuel + auto-close sur quota |

---

## ✅ C. CHATBOT CANDIDAT

| Tâche | Statut | Notes |
|-------|--------|-------|
| Page publique candidat (`/apply/:jobId`) | ✅ Complet | Sans auth, responsive |
| Questions configurables par offre | ✅ Complet | Types : open, multiple, yes_no |
| Soumission de la candidature | ✅ Complet | Crée candidat + candidature + réponses |
| Upload CV | ✅ Complet | Multipart form |
| Confirmation de soumission | ✅ Complet | Écran de succès |

---

## ✅ D. CANDIDATURES

| Tâche | Statut | Notes |
|-------|--------|-------|
| Liste des candidatures avec filtres | ✅ Complet | Statut, offre, recherche texte |
| Détail d'une candidature | ✅ Complet | 5 tabs : Synthèse, CV, Collaboration, Décision, Historique |
| Pipeline de statuts (nouveau → embauché) | ✅ Complet | Transitions validées |
| Analyse automatique des réponses chatbot | ✅ Complet | Heuristique + LLM avec cache 24h |
| Recommandation de statut | ✅ Complet | "Appliquer la recommandation" en 1 clic |
| Historique d'activité (timeline) | ✅ Complet | `ActivityTimeline.tsx` |
| Commentaires internes | ✅ Complet | Visibilité INTERNAL/SHARED + @mentions |

---

## ✅ E. DÉCISIONS

| Tâche | Statut | Notes |
|-------|--------|-------|
| Avis par recruteur (FAVORABLE / RÉSERVÉ / DÉFAVORABLE) | ✅ Complet | `DecisionSection.tsx` |
| Confiance (1-5) sur chaque avis | ✅ Complet | Stocké en DB |
| Décision finale | ✅ Complet | `decidedBy` + `decidedAt` |
| **Signature de contrat** | ❌ Manquant | À implémenter : model + API + UI |

---

## ✅ F. TÂCHES

| Tâche | Statut | Notes |
|-------|--------|-------|
| Création/gestion de tâches par candidature | ✅ Complet | `TasksSection.tsx` |
| Statuts (TODO / IN_PROGRESS / DONE) | ✅ Complet | Avec priorités LOW→URGENT |
| Tâches en retard | ✅ Complet | `GET /api/tasks/overdue` |
| Mes tâches | ✅ Complet | `GET /api/tasks/mine` |

---

## ✅ G. COMMUNICATION

| Tâche | Statut | Notes |
|-------|--------|-------|
| Canal Général (toute l'entreprise) | ✅ Complet | `TeamChat.tsx` |
| Canaux par département | ✅ Complet | Auto-générés depuis les services |
| Notifications internes | ✅ Complet | Avec badge non-lu |
| **Annonces internes** | ❌ Manquant | Model existe, aucune API ni UI |

---

## ✅ H. VUES ÉQUIPE

| Tâche | Statut | Notes |
|-------|--------|-------|
| Vue "Attente d'avis" | ✅ Complet | `TeamViews.tsx` |
| Vue "Prêt à décider" | ✅ Complet | |
| Vue "Attente candidat" | ✅ Complet | |
| Vue "Activité offre" | ✅ Complet | |

---

## ⚠️ I. PARAMÈTRES & PROFIL

| Tâche | Statut | Notes |
|-------|--------|-------|
| Thème clair / sombre / système | ✅ Complet | `ThemeContext` + localStorage |
| Qualité chatbot (métriques) | ✅ Complet | Fenêtre glissante 1-365 jours |
| **Édition du profil utilisateur** | ❌ Manquant | Aucune UI d'édition |
| **Changement de mot de passe** | ❌ Manquant | Aucun endpoint ni UI |

---

## ✅ J. TECHNIQUE

| Tâche | Statut | Notes |
|-------|--------|-------|
| Authentification JWT | ✅ Complet | Login / Register / Protected routes |
| Performance (cache sémantique 24h) | ✅ Complet | Pas de timeout OpenAI sur la liste |
| Upload / download CV et fichiers | ✅ Complet | |
| Analyse GitHub (repos, technologies) | ✅ Complet | `/api/github/analyze` |
| Fix Hibernate ByteBuddyInterceptor | ✅ Complet | `JacksonConfig` + `Hibernate6Module` |

---

## 🐛 BUGS & TODOS À CORRIGER

| Priorité | Fichier | Description |
|----------|---------|-------------|
| 🔴 Haute | `ChatAnswerController.java:47` | `submitAnswer()` est un stub — ne sauvegarde pas réellement |
| 🔴 Haute | `ChatAnswerController.java:64` | `submitAnswers()` est un stub — ne sauvegarde pas réellement |

---

## 🚀 CE QUI RESTE POUR UN PRODUIT VENDABLE

### 🔴 Bloquant (sans ça, le produit est incomplet)

- [ ] **Corriger les stubs `submitAnswer` / `submitAnswers`** dans `ChatAnswerController.java`
- [ ] **Signature de contrat** — étape finale du recrutement (model + API + UI)
- [ ] **Édition du profil** — nom, prénom, photo de profil
- [ ] **Changement de mot de passe** — obligatoire pour la sécurité

### 🟠 Important (à faire avant la vente)

- [ ] **Annonces internes** — exposer l'API `InternalAnnouncement` + créer l'UI
- [ ] **Permissions HIRING_MANAGER** — limiter les actions selon le rôle
- [ ] **Permissions OBSERVER** — accès lecture seule strict
- [ ] **Page "Mot de passe oublié"** — actuellement un placeholder

### 🟡 Améliorations (bonus qualité)

- [ ] **Tests E2E** — couvrir le flux principal candidat → embauche
- [ ] **Email de confirmation** après soumission candidature
- [ ] **Export PDF** d'une candidature
- [ ] **Pagination** sur la liste des candidatures (pour >100 entrées)
- [ ] **Rate limiting** sur l'API publique chatbot

---

## 📈 Score par domaine

| Domaine | Score |
|---------|-------|
| Entreprise | 85% |
| Offres | 100% |
| Chatbot Candidat | 100% |
| Candidatures | 100% |
| Décisions | 75% |
| Tâches | 100% |
| Communication | 67% |
| Vues Équipe | 100% |
| Paramètres | 60% |
| Technique | 100% |
| **TOTAL** | **89%** |

---

*Dernière mise à jour : 29 avril 2026*
