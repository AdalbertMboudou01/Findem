# 🎨 Findem — Améliorations UX
> Aide-mémoire des chantiers UX à réaliser, dans l'ordre d'impact.
> Cocher chaque tâche au fur et à mesure.

---

## 🔴 Chantier 1 — Dashboard d'accueil

**Objectif** : L'utilisateur sait immédiatement quoi faire en ouvrant l'app.

**Page** : `/` (remplacer la page d'accueil actuelle ou créer `Dashboard.tsx`)

**Contenu à afficher** :
- [ ] **Bloc "Mes tâches en retard"** — appel `GET /api/tasks/overdue` — affiche N tâches, lien vers la tâche
- [ ] **Bloc "Candidatures en attente de mon avis"** — appel `GET /api/applications?view=attente_avis` — affiche la liste courte avec lien vers le détail
- [ ] **Bloc "Nouvelles candidatures (< 48h)"** — filtre sur `createdAt > now - 48h`
- [ ] **Bloc "Notifications récentes"** — affiche les 5 dernières non lues

**Navigation** : Ajouter `🏠 Accueil` en premier item de la Sidebar.

**Critère de succès** : L'utilisateur voit en moins de 5 secondes ce qui nécessite son attention.

---

## 🔴 Chantier 2 — Fusionner "Vues Équipe" dans "Candidatures"

**Objectif** : Supprimer le doublon de navigation. Les vues sont des filtres, pas une page séparée.

**Actions** :
- [ ] Supprimer l'item "Vues d'équipe" de la Sidebar (`Sidebar.tsx`)
- [ ] Ajouter des **tabs** en haut de la page Candidatures :
  - `Toutes` (vue actuelle par défaut)
  - `Attente d'avis` (appel `?view=attente_avis`)
  - `Prêt à décider` (appel `?view=pret_a_decider`)
  - `Attente candidat` (appel `?view=attente_candidat`)
- [ ] Supprimer ou archiver `TeamViews.tsx` (conserver le code en commentaire le temps de la migration)

**Critère de succès** : La sidebar ne contient plus de doublon. Les vues sont accessibles depuis la liste en 1 clic.

---

## 🔴 Chantier 3 — Refondre les tabs du détail candidature (5 → 3)

**Objectif** : Réduire la surcharge cognitive. Regrouper les actions liées.

**Fichier** : `CandidateDetail.tsx`

| Avant | Après |
|-------|-------|
| Synthèse | **Évaluation** (analyse auto + recommandation + changer statut + donner son avis) |
| CV | **Profil** (CV + GitHub + portfolio) |
| Collaboration | **Équipe** (avis des membres + décision finale + commentaires) |
| Décision | *(fusionné dans Équipe)* |
| Historique | *(accordéon replié en bas de page, pas un onglet)* |

**Actions** :
- [ ] Renommer et fusionner les tabs
- [ ] Déplacer `DecisionSection` dans le tab "Équipe"
- [ ] Transformer la Timeline en accordéon en bas de page (toujours visible mais non prioritaire)
- [ ] Vérifier que l'action "Appliquer la recommandation" est visible **sans scroll** au premier chargement

**Critère de succès** : L'utilisateur peut évaluer et décider sans changer d'onglet plus d'une fois.

---

## 🟠 Chantier 4 — Déplacer "Qualité chatbot" hors des Paramètres

**Objectif** : Les Paramètres servent à configurer, pas à consulter des métriques.

**Actions** :
- [ ] Retirer le bloc "Qualité chatbot" de `Settings.tsx`
- [ ] L'ajouter dans la page détail d'une offre (`OfferDetail.tsx` ou onglet dédié dans Offres) sous le libellé **"Performance du chatbot"**
- [ ] Conserver les mêmes données (fenêtre glissante 1-365 jours, taux de validation)

**Critère de succès** : Les Paramètres ne contiennent que : Mon profil · Entreprise & membres · Thème.

---

## 🟠 Chantier 5 — Écran "first-run" après inscription

**Objectif** : Éviter l'abandon après l'onboarding. Guider vers la première action utile.

**Actions** :
- [ ] Détecter si l'entreprise n'a pas encore d'offre (`offers.length === 0`)
- [ ] Si oui, afficher une bannière ou un écran interstitiel :
  > *"Votre espace est prêt. Commencez par créer votre première offre pour recevoir des candidatures."*
  > → Bouton **"Créer une offre"**
- [ ] Fermer cette bannière une fois la première offre créée (ou via un bouton "Ignorer")

**Critère de succès** : Un nouvel utilisateur sait quoi faire dans les 10 premières secondes.

---

## 🟡 Chantier 6 — Tooltips sur les statuts du pipeline

**Objectif** : Les statuts techniques (`SHORTLISTED`, `INTERVIEW_SCHEDULED`…) ne sont pas compréhensibles pour tous.

**Actions** :
- [ ] Identifier tous les statuts du pipeline (enum `Application.Status`)
- [ ] Ajouter une tooltip sur chaque badge de statut (hover ou `?` icon)
- [ ] Libellés à définir par statut :

| Statut | Tooltip suggérée |
|--------|-----------------|
| NEW | Candidature reçue, pas encore examinée |
| REVIEWING | En cours d'examen par l'équipe |
| SHORTLISTED | Candidat présélectionné, décision à venir |
| INTERVIEW_SCHEDULED | Entretien planifié |
| OFFER_SENT | Offre d'embauche envoyée |
| HIRED | Candidat embauché ✓ |
| REJECTED | Candidature déclinée |

**Critère de succès** : Tout membre de l'équipe comprend un statut sans demander à quelqu'un.

---

## 🟡 Chantier 7 — Masquer les rôles non implémentés

**Objectif** : Ne pas afficher HIRING_MANAGER / OBSERVER dans l'UI tant que les permissions backend ne sont pas actives.

**Actions** :
- [ ] Repérer dans `Entreprise.tsx` (gestion membres) les endroits où le rôle est sélectionnable
- [ ] Remplacer par : `ADMIN` et `RECRUTEUR` uniquement (dropdown ou radio)
- [ ] Ajouter un commentaire dans le code : `// TODO: activer quand les permissions sont implémentées`

**Critère de succès** : Un admin ne peut pas assigner un rôle dont les permissions n'existent pas.

---

## 📋 Récapitulatif par priorité

| # | Chantier | Priorité | Complexité | Fichiers principaux |
|---|----------|----------|------------|---------------------|
| 1 | Dashboard d'accueil | 🔴 Haute | Moyenne | `Dashboard.tsx` (à créer), `Sidebar.tsx` |
| 2 | Fusionner Vues Équipe dans Candidatures | 🔴 Haute | Faible | `Applications.tsx`, `Sidebar.tsx` |
| 3 | Refondre tabs détail candidature | 🔴 Haute | Moyenne | `CandidateDetail.tsx` |
| 4 | Déplacer Qualité chatbot | 🟠 Moyenne | Faible | `Settings.tsx`, `OfferDetail.tsx` |
| 5 | Écran first-run | 🟠 Moyenne | Faible | `App.tsx` ou layout |
| 6 | Tooltips statuts pipeline | 🟡 Basse | Faible | `ApplicationCard.tsx` ou shared |
| 7 | Masquer rôles non implémentés | 🟡 Basse | Faible | `Entreprise.tsx` |

---

*Créé le 29 avril 2026 — suite à l'audit UX Findem*
