# Plan de développement du projet Assistant de préqualification

## 1. Initialisation et préparation
- [ ] Créer le dépôt Git et initialiser le projet
- [ ] Définir la structure des dossiers (backend Spring Boot, frontend React, docs, scripts, etc.)
- [ ] Mettre en place le fichier .env (variables sensibles)
- [ ] Rédiger le README et la documentation d’architecture

## 2. Backend (Spring Boot)
- [ ] Générer le projet Spring Boot (Maven/Gradle)
- [ ] Configurer la connexion PostgreSQL (application.properties/yml)
- [ ] Définir les entités JPA (Company, Recruiter, Job, Candidate, Application, etc.)
- [ ] Créer les repositories (Spring Data JPA)
- [ ] Implémenter la logique métier (services)
- [ ] Créer les contrôleurs REST (API)
- [ ] Gérer la sécurité (Spring Security, JWT)
- [ ] Gérer la validation des données (DTO, validation)
- [ ] Implémenter la gestion des statuts, vivier, synthèses, etc.
- [ ] Gérer l’upload et l’analyse de liens (GitHub, portfolio)
- [ ] Ajouter la documentation Swagger/OpenAPI
- [ ] Écrire des tests unitaires et d’intégration (JUnit, MockMvc)
- [ ] Préparer le Dockerfile backend

## 3. Base de données
- [ ] Générer les scripts de création de tables (si besoin)
- [ ] Mettre en place les migrations (Flyway ou Liquibase)
- [ ] Tester la persistance et l’intégrité des données

## 4. Frontend (React)
- [ ] Initialiser le projet React (Vite ou Create React App)
- [ ] Définir la structure des dossiers (components, pages, services, etc.)
- [ ] Créer les pages principales (Accueil, Chatbot, Dashboard Recruteur, etc.)
- [ ] Implémenter le chatbot (UI + logique d’appel API)
- [ ] Gérer l’authentification et la gestion de session
- [ ] Créer les formulaires candidats (questions, upload liens, etc.)
- [ ] Créer le tableau de bord recruteur (fiches synthétiques, filtres, actions)
- [ ] Gérer les statuts et notifications côté UI
- [ ] Ajouter le style (MUI, Tailwind, etc.)
- [ ] Écrire des tests front (Jest, React Testing Library)
- [ ] Préparer le Dockerfile frontend

## 5. Intégration et communication
- [ ] Définir le contrat d’API (endpoints, payloads)
- [ ] Tester les appels API depuis le frontend
- [ ] Gérer les erreurs et les cas limites (front et back)

## 6. Déploiement et CI/CD
- [ ] Mettre à jour le docker-compose.yml pour tous les services
- [ ] Ajouter un pipeline CI/CD (GitHub Actions, GitLab CI, etc.)
- [ ] Tester le déploiement local et sur un serveur distant

## 7. Documentation et qualité
- [ ] Compléter la documentation technique et fonctionnelle
- [ ] Rédiger des guides d’utilisation (recruteur, candidat)
- [ ] Mettre en place l’analyse statique (SonarQube, etc.)
- [ ] Préparer la soutenance et les livrables

---

**Astuce** : coche chaque étape au fur et à mesure pour suivre ta progression !
