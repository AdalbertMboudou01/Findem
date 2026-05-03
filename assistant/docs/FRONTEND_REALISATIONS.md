# Realisations frontend Findem

Ce document sert de journal de construction du frontend. Chaque page est ajoutee seulement apres validation de la precedente.

## Principes

- Frontend React construit page par page.
- Premiere page commune a tous les roles : authentification et entree dans l'application.
- Premier espace fonctionnel traite apres validation de l'entree : `ADMIN`.
- Chaque page doit tester directement les endpoints backend concernes.
- Interface inspiree de Microsoft Teams pour la collaboration : barre laterale sobre, panneaux de travail, contexte visible.
- Police cible : `Segoe UI`, avec fallback systeme.

## Page commune

| Ordre | Page | Statut | Endpoints principaux |
| --- | --- | --- | --- |
| 0 | Entree application / Authentification | En cours | `POST /api/auth/login`, `POST /api/auth/register-company-owner` |

## Pages admin minimales

| Ordre | Page | Statut | Endpoints principaux |
| --- | --- | --- | --- |
| 1 | Tableau de bord admin | A faire | `GET /api/jobs`, `GET /api/recruiters`, `GET /api/applications` |
| 2 | Gestion des offres | A faire | `GET /api/jobs`, `POST /api/jobs`, `GET /api/jobs/{id}`, `PUT /api/jobs/{id}`, `DELETE /api/jobs/{id}` |
| 3 | Configuration d'une offre | A faire | `GET /api/jobs/{jobId}/questions`, `POST /api/jobs/{jobId}/questions`, `PUT /api/jobs/{jobId}/questions/{questionId}`, `DELETE /api/jobs/{jobId}/questions/{questionId}`, `GET /api/jobs/{jobId}/settings` |
| 4 | Equipe / Departements | A faire | `GET /api/recruiters`, `GET /api/departments`, `POST /api/departments`, `PUT /api/departments/{id}`, `DELETE /api/departments/{id}` |
| 5 | Pipeline / Statuts de candidature | A faire | `GET /api/application-statuses`, `POST /api/application-statuses`, `PUT /api/application-statuses/{id}`, `DELETE /api/application-statuses/{id}` |
| 6 | Vue candidatures admin | A faire | `GET /api/applications`, `GET /api/applications/{id}`, `GET /api/applications/{id}/activity` |

## Realisations

### 2026-05-03 - Page commune : Entree application / Authentification

Objectif :

- Initialiser un frontend React propre.
- Permettre a n'importe quel utilisateur existant de se connecter.
- Permettre la creation d'un espace entreprise pour initialiser un administrateur.
- Stocker la session minimale cote navigateur : token JWT, role, userId, recruiterId, companyId.
- Afficher un resume de session pour valider le role renvoye par le backend.

Validation attendue :

- `POST /api/auth/register-company-owner` renvoie `role=ADMIN`, `companyId`, `recruiterId`.
- `POST /api/auth/login` renvoie une session exploitable.
- L'interface affiche le role courant, l'entreprise et le recruteur quand ils existent.
