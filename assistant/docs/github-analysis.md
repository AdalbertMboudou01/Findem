# Analyse GitHub des candidatures

Ce document explique comment l'application recupere, analyse et affiche les informations GitHub d'un candidat.

## Vue d'ensemble

L'analyse GitHub suit ce flux principal :

1. Le frontend charge la liste des candidatures.
2. Pour chaque candidature, le frontend appelle l'endpoint de synthese chatbot.
3. Le backend construit l'analyse globale de la candidature.
4. Pendant cette analyse, le backend verifie si le candidat a une URL GitHub et/ou portfolio.
5. Si une URL GitHub est presente, le backend appelle l'API publique GitHub.
6. Le backend transforme les donnees GitHub en signaux exploitables pour la synthese.
7. Le frontend affiche ces signaux dans la fiche candidat.

## 1. Source des URLs GitHub et portfolio

Les URLs externes sont stockees sur l'entite candidat.

Fichier source :
- backend/src/main/java/com/memoire/assistant/model/Candidate.java

Champs utilises :
- githubUrl
- portfolioUrl

## 2. Point d'entree principal utilise par le frontend

Le frontend ne declenche pas directement un endpoint GitHub dedie dans le parcours principal de consultation des candidats.

Il passe par le resume d'analyse de candidature :
- endpoint : GET /api/chat-answers/summary/{applicationId}
- controleur : backend/src/main/java/com/memoire/assistant/controller/ChatAnswerController.java

Ce endpoint renvoie notamment :
- motivationSummary
- technicalSkills
- mentionedProjects
- githubSummary
- recommendedAction

## 3. Appel frontend

Le frontend appelle l'endpoint de synthese dans :
- frontend/src/lib/domainApi.ts

Methode concernee :
- loadRecruitmentData()

Comportement :
- recupere jobs, candidats et candidatures
- associe chaque candidat a sa candidature
- appelle GET /api/chat-answers/summary/{applicationId}
- injecte le resultat dans le modele frontend du candidat

Le champ githubSummary est ensuite ajoute a la partie projet/synthese via projet_cite.

## 4. Construction de l'analyse cote backend

Le point central est :
- backend/src/main/java/com/memoire/assistant/service/ChatAnswerService.java

Methode principale :
- analyzeChatAnswers(UUID applicationId)

Cette methode :
1. charge la candidature
2. charge les reponses du chatbot
3. analyse la motivation
4. analyse le profil technique
5. enrichit l'analyse avec GitHub et portfolio
6. analyse disponibilite et localisation
7. calcule une recommandation finale

L'enrichissement GitHub se fait dans :
- enrichWithGitHubAndPortfolio(Application application, ChatAnswerAnalysisDTO analysis)

## 5. Service d'analyse GitHub

Le service dedie est :
- backend/src/main/java/com/memoire/assistant/service/GitHubAnalysisService.java

Constante d'API utilisee :
- https://api.github.com

### Methode principale

- analyzeGitHubProfile(String githubUrl)

Cette methode :
1. extrait le username GitHub depuis l'URL candidat
2. recupere le profil public GitHub
3. recupere les repositories publics
4. calcule des indicateurs techniques
5. construit un GithubAnalysisDTO

### Appels externes effectues

Profil utilisateur :
- GET https://api.github.com/users/{username}

Repositories publics :
- GET https://api.github.com/users/{username}/repos

### Donnees exploitees

Le service essaie d'extraire :
- nombre de depots publics
- langages detectes
- technologies deduites via un mapping interne
- highlights de projets
- nombre total d'etoiles
- nombre total de forks
- score d'activite
- score de completude du profil

## 6. Comment les donnees GitHub enrichissent la synthese

Dans ChatAnswerService, le resultat GitHub sert a enrichir plusieurs zones de la synthese :

### a. Competences techniques

Les langages et technologies detectes sur GitHub sont fusionnes avec les competences extraites des reponses chatbot.

Impact :
- enrichit technicalSkills

### b. Projets mentionnes

Les projets GitHub juges saillants sont ajoutes aux projets mentionnes.

Impact :
- enrichit mentionedProjects

### c. Resume GitHub lisible

Le backend construit un texte de synthese court, par exemple :
- GitHub: 5 depots publics, 12 etoiles, activite 64/100

Impact :
- alimente githubSummary

### d. Portfolio

Si un portfolio est renseigne, le backend tente aussi une analyse simple d'accessibilite.

Impact :
- complete githubSummary avec un statut de portfolio

## 7. Affichage dans le frontend

Le frontend lit githubSummary dans :
- frontend/src/lib/domainApi.ts

Puis il combine :
- mentionedProjects
- githubSummary

pour produire le champ affiche dans la synthese candidat :
- projet_cite

Ce champ est ensuite rendu dans la fiche candidat dans :
- frontend/src/pages/CandidateDetail.tsx

Concretement, l'utilisateur voit donc les signaux GitHub dans le bloc projet/experience de la fiche.

## 8. Endpoints GitHub dedies disponibles

En plus du flux principal de synthese, des endpoints dedies existent dans :
- backend/src/main/java/com/memoire/assistant/controller/CandidateController.java

Endpoints disponibles :
- GET /api/candidates/{id}/github-analysis
- POST /api/candidates/{id}/github-skills-analysis
- POST /api/candidates/{id}/portfolio-analysis

Usage actuel :
- ces endpoints existent cote backend
- le flux principal de la liste/fiches candidats passe aujourd'hui surtout par GET /api/chat-answers/summary/{applicationId}

## 9. Limitations actuelles

L'analyse GitHub actuelle repose sur des regles et des heuristiques, pas sur une analyse semantique avancee.

Exemples de limites :
- seuls les depots publics sont visibles
- pas d'analyse du contenu complet du code source depot par depot
- deduction de technologies via langages, descriptions et mappings internes
- dependance aux limites de rate limiting de l'API GitHub publique
- la qualite du resultat depend de la qualite de l'URL GitHub fournie par le candidat

## 10. Resume ultra court

Aujourd'hui, l'app analyse GitHub comme ceci :

1. elle recupere l'URL GitHub du candidat
2. elle appelle l'API publique GitHub depuis le backend
3. elle extrait depots, langages, activite et projets saillants
4. elle integre ces signaux dans le resume de candidature
5. le frontend affiche ce resume dans la fiche candidat
