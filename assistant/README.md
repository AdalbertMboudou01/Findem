# Assistant de préqualification pour alternants IT

Ce projet vise à concevoir un assistant conversationnel de préqualification destiné au recrutement d’alternants IT, capable de traiter un volume important de candidatures tout en conservant une logique d’aide au recruteur sans scoring opaque.

## Structure du projet

- `backend/` : API, logique métier, intégrations, base de données
- `frontend/` : Interface web (candidat, recruteur)
- `docs/` : Documentation technique et fonctionnelle
- `scripts/` : Scripts de déploiement, CI/CD

Voir le dossier `docs/` pour plus de détails sur l’architecture et les choix techniques.

# Précision importante

Ce projet n’est pas un ATS (Applicant Tracking System). Il ne vise pas à automatiser le recrutement, mais à fournir une aide à la préqualification, en structurant et en synthétisant les candidatures pour faciliter la décision humaine, dans une logique transparente et explicable.

---

## Logique métier et workflows

### Objectif et philosophie

- Assistant conversationnel de préqualification pour alternants IT, centré sur l’aide au recruteur, sans scoring opaque ni classement automatique.
- Accélérer le tri des candidatures, structurer la préqualification, valoriser les preuves concrètes (projets, GitHub…), et fournir des synthèses homogènes et exploitables.


### Expérience candidat

- Aucun compte requis.
- Accès au chatbot via un lien direct intégré à chaque offre (diffusé sur jobboards, etc.).
- **Avant d'accéder au chatbot, le candidat doit remplir un formulaire simple pour renseigner son nom, prénom et adresse mail.**
- Chatbot posant ensuite une série de questions personnalisées selon l’offre et structurées : parcours, motivation, projets, disponibilité, rythme d’alternance, etc.
- Possibilité de fournir (optionnel) des liens GitHub/portfolio.
- Réponses structurées, analysées, puis synthétisées : pas de scoring, mais une fiche descriptive claire.
- Le candidat reçoit une réponse adaptée selon la décision du recruteur (retenu, à revoir, non retenu, vivier).

### Expérience recruteur

- Création d’offre : chaque offre génère une URL unique pour le chatbot, contextualisée (poste, entreprise, questions…).
- Réception : le recruteur ne voit pas les conversations brutes, mais des fiches synthétiques normalisées : statut, compatibilité, motivation, projets, signaux techniques, points d’attention, action recommandée.
- Tri : moteur de filtrage appliquant une grille de lecture à trois niveaux :
	1. Critères bloquants (ex : rythme, mobilité, droit au contrat…)
	2. Critères de pertinence (motivation, cohérence, projets…)
	3. Génération de la synthèse et transmission selon la catégorie : à écarter, à revoir, à examiner, prioritaire.
- Gestion des suites : le recruteur peut : retenir (entretien), revoir, écarter, placer au vivier.
- Vivier : profils non retenus mais intéressants conservés pour d’autres opportunités, avec historique et filtres.

### Fonctionnalités clés

- Chatbot web accessible par lien direct, questions identiques pour tous.
- Génération d’URL dédiée par offre.
- Collecte optionnelle de liens GitHub/portfolio, analyse descriptive des dépôts publics.
- Extraction, structuration et synthèse automatique des réponses.
- Tableau de bord recruteur avec filtres (statut, techno, disponibilité, priorité…).
- Gestion des statuts candidats et du vivier.
- Prise de rendez-vous intégrée (ex : Calendly) pour les profils retenus.
- Communication adaptée selon l’issue (pas de ghosting).

### Architecture cible

- Interface candidat (chatbot web)
- Interface recruteur (tableau de bord, fiches synthétiques)
- Base de données (candidatures, offres, vivier)
- Serveur backend (logique métier, intégrations externes)
- Moteur de structuration/synthèse
- Module de gestion des statuts et du vivier

### MVP

- Chatbot web, base de données candidatures, moteur de filtrage, génération de fiches synthétiques, tableau de bord recruteur, gestion simple des statuts, accès par lien direct, connecteur prise de rendez-vous, vivier basique.

### Indicateurs de succès

- Temps moyen de tri, % de fiches jugées utiles, taux de conversion vers entretien, taux d’abandon candidat, qualité perçue de la priorisation, taux de réutilisation du vivier, taux de complétion du parcours chatbot.

### Points différenciants

- Pas de scoring global ni de classement automatique.
- Grille de lecture transparente, statuts explicites, synthèses comparables.
- Décision finale toujours humaine (“human-in-the-loop”).
- Respect de la protection des données, traçabilité, transparence.
## Stack technique

- **Backend** : Spring Boot (Java)
- **Frontend** : React (JavaScript/TypeScript)
- **Base de données** : PostgreSQL
- **Orchestration** : Docker & Docker Compose
- **Sécurité** : Variables sensibles dans `.env`, accès restreint, pas de scoring opaque

## Fonctionnement général

L’assistant se compose de trois services principaux :

- **Backend** : API REST, logique métier, gestion des utilisateurs, des candidatures, des statuts, etc.
- **Frontend** : Interface web pour les candidats (chatbot, formulaires) et les recruteurs (tableau de bord, synthèses)
- **Base de données** : Stockage structuré des entreprises, recruteurs, offres, candidats, candidatures, statuts, etc.

La communication entre les services se fait via des API sécurisées. Les secrets et accès sensibles sont centralisés dans le fichier `.env` (non versionné).

## Lancement rapide (développement)

Prérequis : Docker et Docker Compose installés.

1. Copier le fichier `.env` fourni en exemple et adapter les valeurs si besoin.
2. Lancer tous les services :

```bash
docker-compose up --build
```

3. Accéder aux interfaces :
	- Frontend : http://localhost:3100
	- Backend : http://localhost:8100
	- Base PostgreSQL : port 55432 (accès via pgAdmin4 ou autre)

## Structure des dossiers

- `backend/` : Projet Spring Boot, migrations SQL dans `backend/migrations/`
- `frontend/` : Projet React
- `docs/` : Documentation technique et fonctionnelle (`architecture.md`, `vision.md`, `user-stories.md`, `api.md`)
- `scripts/` : Scripts de déploiement, CI/CD
- `.env` : Variables sensibles (à ne pas versionner)
- `docker-compose.yml` : Orchestration des services
- `TODO.md` : Plan de développement chronologique

## Documentation

Pour plus de détails sur l’architecture, les user stories, l’API et la vision du projet, voir le dossier `docs/`.

## Pour aller plus loin

- Compléter le README au fil de l’avancement (exemples d’API, captures d’écran, guides d’utilisation)
- Suivre la progression dans `TODO.md`
