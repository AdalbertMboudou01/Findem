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
