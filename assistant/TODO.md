# Plan de développement du projet Assistant de préqualification

## 1. Initialisation et préparation
- [x] Créer le dépôt Git et initialiser le projet
- [x] Définir la structure des dossiers (backend Spring Boot, frontend React, docs, scripts, etc.)
- [x] Mettre en place le fichier .env (variables sensibles)
- [x] Rédiger le README et la documentation d’architecture

## 2. Backend (Spring Boot)
- [x] Générer le projet Spring Boot (Gradle)
- [x] Configurer la connexion PostgreSQL (application.properties/yml)
- [x] Définir les entités JPA (Company, Recruiter, Job, Candidate, Application, etc.)
- [x] Créer les repositories (Spring Data JPA)
- [x] Implémenter la logique métier de base (services CRUD)
- [x] Créer les contrôleurs REST (API CRUD)
- [x] Gérer la sécurité (Spring Security, JWT) pour les recruteurs
- [x] Gérer la validation des données (DTO, validation)
- [x] Ajouter la documentation Swagger/OpenAPI
- [x] Écrire des tests unitaires et d’intégration (JUnit, MockMvc)
- [x] Préparer le Dockerfile backend
- [x] **Formulaire d’identification candidat** (nom, prénom, mail) via API
- [x] **API pour le chatbot** (génération dynamique des questions selon l’offre)
- [ ] **Collecte et structuration des réponses du chatbot**
- [ ] **Upload de CV et collecte de liens (GitHub, portfolio, etc.)**
- [ ] **Génération automatique de la fiche synthétique**
- [ ] **Moteur de filtrage (critères bloquants, pertinence, statuts)**
- [ ] **Gestion du vivier (stockage, recherche, réactivation de profils)**
- [ ] **Gestion des notifications (emails candidats selon statut)**
- [ ] **Intégration prise de rendez-vous (Calendly ou équivalent)**
- [ ] **Analyse GitHub/portfolio (optionnelle)**

## 3. Base de données
- [ ] Générer les scripts de création de tables (si besoin)
- [ ] Mettre en place les migrations (Flyway ou Liquibase)
- [ ] Tester la persistance et l’intégrité des données

## 4. Frontend (React)
- [x] Initialiser le projet React (Vite ou Create React App)
- [x] Définir la structure des dossiers (components, pages, services, etc.)
- [ ] Créer la page d’accueil
- [ ] **Formulaire d’identification candidat (nom, prénom, mail)**
- [ ] **Implémenter le chatbot dynamique (UI + logique d’appel API, questions personnalisées selon l’offre)**
- [ ] **Upload de CV et collecte de liens (GitHub, portfolio, etc.)**
- [ ] **Création du tableau de bord recruteur (fiches synthétiques, filtres, actions sur statuts, vivier)**
- [ ] **Affichage des statuts et notifications côté UI**
- [ ] **Intégration prise de rendez-vous (Calendly ou équivalent)**
- [ ] Ajouter le style (MUI, Tailwind, etc.)
- [ ] Écrire des tests front (Jest, React Testing Library)
- [x] Préparer le Dockerfile frontend

## 5. Intégration et communication
- [x] Définir le contrat d’API (endpoints, payloads)
- [ ] Tester les appels API depuis le frontend
- [ ] Gérer les erreurs et les cas limites (front et back)
- [ ] **Tests d’intégration bout-en-bout (parcours complet candidat → recruteur)**

## 6. Déploiement et CI/CD
- [ ] Mettre à jour le docker-compose.yml pour tous les services
- [ ] Ajouter un pipeline CI/CD (GitHub Actions, GitLab CI, etc.)
- [ ] Tester le déploiement local et sur un serveur distant

## 7. Documentation et qualité
- [x] Compléter la documentation technique et fonctionnelle (README, logique métier, workflows)
- [ ] Rédiger des guides d’utilisation (recruteur, candidat)
- [ ] Ajouter des exemples d’API, captures d’écran, guides d’utilisation dans le README/docs
- [ ] Mettre en place l’analyse statique (SonarQube, etc.)
- [ ] Préparer la soutenance et les livrables
- [ ] **Gestion RGPD et consentement candidat**
- [ ] **Amélioration de l’ergonomie et de l’UX**

---

**Astuce** : coche chaque étape au fur et à mesure pour suivre ta progression !
