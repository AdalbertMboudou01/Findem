const FINDem_WORKER_ID = "00000000-0000-0000-0000-000000000003";

const initialState = {
  apiBase: localStorage.getItem("findem.apiBase") || "http://localhost:8100",
  token: localStorage.getItem("findem.token") || "",
  userId: localStorage.getItem("findem.userId") || "",
  recruiterId: localStorage.getItem("findem.recruiterId") || "",
  companyId: localStorage.getItem("findem.companyId") || "",
  jobId: localStorage.getItem("findem.jobId") || "",
  candidateId: localStorage.getItem("findem.candidateId") || "",
  applicationId: localStorage.getItem("findem.applicationId") || "",
  lastAnalysis: null,
  comments: [],
  tasks: [],
  decision: null,
  activity: []
};

const state = { ...initialState };

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const elements = {
  apiBase: $("#apiBase"),
  apiLog: $("#apiLog"),
  sessionState: $("#sessionState"),
  companyMetric: $("#companyMetric"),
  jobMetric: $("#jobMetric"),
  applicationMetric: $("#applicationMetric"),
  aiMetric: $("#aiMetric"),
  stateList: $("#stateList"),
  commentsView: $("#commentsView"),
  tasksView: $("#tasksView"),
  decisionView: $("#decisionView"),
  activityView: $("#activityView"),
  jobStatus: $("#jobStatus"),
  candidateStatus: $("#candidateStatus"),
  answersStatus: $("#answersStatus"),
  decisionStatus: $("#decisionStatus")
};

elements.apiBase.value = state.apiBase;

function saveState() {
  for (const key of ["apiBase", "token", "userId", "recruiterId", "companyId", "jobId", "candidateId", "applicationId"]) {
    if (state[key]) {
      localStorage.setItem(`findem.${key}`, state[key]);
    } else {
      localStorage.removeItem(`findem.${key}`);
    }
  }
  renderState();
}

function resetState() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith("findem.")) {
      localStorage.removeItem(key);
    }
  }
  Object.assign(state, {
    ...initialState,
    apiBase: elements.apiBase.value || "http://localhost:8100",
    token: "",
    userId: "",
    recruiterId: "",
    companyId: "",
    jobId: "",
    candidateId: "",
    applicationId: "",
    lastAnalysis: null,
    comments: [],
    tasks: [],
    decision: null,
    activity: []
  });
  log("Demo state reset", {});
  saveState();
  renderCollections();
}

function headers(json = true) {
  const result = {};
  if (json) result["Content-Type"] = "application/json";
  if (state.token) result.Authorization = `Bearer ${state.token}`;
  return result;
}

async function api(path, options = {}) {
  const url = `${state.apiBase}${path}`;
  const init = {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...headers(options.json !== false)
    }
  };

  if (init.body && typeof init.body !== "string") {
    init.body = JSON.stringify(init.body);
  }

  log(`-> ${init.method || "GET"} ${path}`, init.body ? safeJson(init.body) : null);

  const response = await fetch(url, init);
  const text = await response.text();
  const data = text ? tryJson(text) : null;

  log(`<- ${response.status} ${path}`, data ?? text);

  if (!response.ok) {
    const message = data?.message || data?.error || text || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function tryJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function safeJson(value) {
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return value;
  }
}

function log(title, payload) {
  const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const body = payload == null ? "" : `\n${JSON.stringify(payload, null, 2)}`;
  elements.apiLog.textContent = `[${time}] ${title}${body}\n\n${elements.apiLog.textContent}`;
}

function shortId(value) {
  if (!value) return "-";
  return `${value.slice(0, 8)}...`;
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setBusy(button, busy) {
  button.disabled = busy;
  button.dataset.originalText ||= button.textContent;
  button.textContent = busy ? "..." : button.dataset.originalText;
}

async function runAction(button, fn) {
  try {
    setBusy(button, true);
    await fn();
  } catch (error) {
    log("Action error", { message: error.message });
    alert(error.message);
  } finally {
    setBusy(button, false);
    renderState();
  }
}

function renderState() {
  elements.sessionState.textContent = state.token ? "Session active" : "Hors session";
  elements.companyMetric.textContent = shortId(state.companyId);
  elements.jobMetric.textContent = shortId(state.jobId);
  elements.applicationMetric.textContent = shortId(state.applicationId);
  elements.aiMetric.textContent = state.lastAnalysis ? state.lastAnalysis.recommendedAction || "Analyse OK" : "Prete";

  elements.jobStatus.textContent = state.jobId ? "Creee" : "En attente";
  elements.candidateStatus.textContent = state.applicationId ? "Creee" : "En attente";
  elements.answersStatus.textContent = state.lastAnalysis ? "Analysee" : "Pret";
  elements.decisionStatus.textContent = state.decision?.finalStatus || "En attente";

  const rows = [
    ["API", state.apiBase],
    ["Token", state.token ? `${state.token.slice(0, 22)}...` : "-"],
    ["Company", state.companyId || "-"],
    ["Recruiter", state.recruiterId || "-"],
    ["Job", state.jobId || "-"],
    ["Candidate", state.candidateId || "-"],
    ["Application", state.applicationId || "-"],
    ["Worker", FINDem_WORKER_ID]
  ];

  elements.stateList.innerHTML = rows.map(([label, value]) => `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `).join("");
}

function renderCollections() {
  renderComments();
  renderTasks();
  renderDecision();
  renderActivity();
}

function renderComments() {
  if (!state.comments.length) {
    elements.commentsView.innerHTML = empty("Aucun commentaire");
    return;
  }

  elements.commentsView.innerHTML = state.comments.map((comment) => `
    <article class="item ${comment.authorType === "AI_SYSTEM" ? "ai-system" : ""}">
      <strong>${escapeHtml(comment.authorType || "COMMENT")}</strong>
      <span>${escapeHtml(comment.body || "")}</span>
      <small>${escapeHtml(comment.createdAt || "")}</small>
    </article>
  `).join("");
}

function renderTasks() {
  if (!state.tasks.length) {
    elements.tasksView.innerHTML = empty("Aucune tache");
    return;
  }

  elements.tasksView.innerHTML = state.tasks.map((task) => `
    <article class="item">
      <strong>${escapeHtml(task.title || task.taskType || "Tache")}</strong>
      <span>${escapeHtml(task.status || "-")} · ${escapeHtml(task.taskType || "-")}</span>
      ${task.aiResult ? `<pre>${escapeHtml(task.aiResult)}</pre>` : ""}
    </article>
  `).join("");
}

function renderDecision() {
  if (!state.decision) {
    elements.decisionView.innerHTML = empty("Aucune decision");
    return;
  }

  elements.decisionView.innerHTML = `
    <article class="item">
      <strong>${escapeHtml(state.decision.finalStatus || "Decision")}</strong>
      <span>${escapeHtml(state.decision.rationale || "")}</span>
      ${state.decision.aiReview ? `<pre>${escapeHtml(state.decision.aiReview)}</pre>` : ""}
    </article>
  `;
}

function renderActivity() {
  if (!state.activity.length) {
    elements.activityView.innerHTML = empty("Aucune activite");
    return;
  }

  elements.activityView.innerHTML = state.activity.map((event) => `
    <article class="item">
      <strong>${escapeHtml(event.eventType || "EVENT")}</strong>
      <span>${escapeHtml(event.actorType || "SYSTEM")} · ${escapeHtml(event.visibility || "-")}</span>
      <pre>${escapeHtml(JSON.stringify(event.payload || {}, null, 2))}</pre>
    </article>
  `).join("");
}

function empty(text) {
  return `<div class="item"><span>${escapeHtml(text)}</span></div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function refreshAll() {
  if (!state.applicationId) {
    renderCollections();
    return;
  }

  const calls = [
    api(`/api/applications/${state.applicationId}/comments`).then((data) => { state.comments = data || []; }),
    api(`/api/applications/${state.applicationId}/tasks`).then((data) => { state.tasks = data || []; }),
    api(`/api/applications/${state.applicationId}/decision`).then((data) => { state.decision = data || null; }),
    api(`/api/applications/${state.applicationId}/activity`).then((data) => { state.activity = data || []; })
  ];

  await Promise.allSettled(calls);
  renderCollections();
  saveState();
}

function uniqueEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local}+${Date.now()}@${domain}`;
}

$("#authPanel").addEventListener("submit", (event) => {
  event.preventDefault();
  runAction(event.submitter, async () => {
    const data = formData(event.currentTarget);
    const payload = {
      fullName: data.fullName,
      email: uniqueEmail(data.email),
      password: data.password,
      confirmPassword: data.password,
      companyName: data.companyName,
      sector: data.sector,
      size: data.size,
      website: "https://example.com",
      plan: "demo"
    };

    const result = await api("/api/auth/register-company-owner", {
      method: "POST",
      body: payload
    });

    state.token = result.token;
    state.userId = result.userId;
    state.recruiterId = result.recruiterId;
    state.companyId = result.companyId;
    event.currentTarget.email.value = payload.email;
    saveState();
  });
});

$("#loginButton").addEventListener("click", (event) => {
  const form = $("#authPanel");
  runAction(event.currentTarget, async () => {
    const data = formData(form);
    const result = await api("/api/auth/login", {
      method: "POST",
      body: {
        email: data.email,
        password: data.password
      }
    });

    state.token = result.token;
    state.userId = result.userId;
    state.recruiterId = result.recruiterId;
    state.companyId = result.companyId;
    saveState();
  });
});

$("#jobPanel").addEventListener("submit", (event) => {
  event.preventDefault();
  runAction(event.submitter, async () => {
    requireSession();
    const data = formData(event.currentTarget);
    const result = await api("/api/jobs", {
      method: "POST",
      body: {
        title: data.title,
        description: data.description,
        location: data.location,
        alternanceRhythm: data.alternanceRhythm,
        blockingCriteria: { mustHave: ["Java", "Spring"] },
        companyId: state.companyId,
        ownerRecruiterId: state.recruiterId
      }
    });

    state.jobId = result.jobId;
    saveState();
  });
});

$("#candidatePanel").addEventListener("submit", (event) => {
  event.preventDefault();
  runAction(event.submitter, async () => {
    if (!state.jobId) throw new Error("Cree d'abord une offre");
    const data = formData(event.currentTarget);
    const candidateEmail = uniqueEmail(data.email);
    const result = await api("/api/apply", {
      method: "POST",
      body: {
        jobId: state.jobId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: candidateEmail,
        phone: "+33123456789",
        school: data.school,
        githubUrl: data.githubUrl,
        portfolioUrl: "https://example.com/portfolio",
        consent: true
      }
    });

    state.candidateId = result.candidateId;
    state.applicationId = result.applicationId;
    event.currentTarget.email.value = candidateEmail;
    saveState();
    await refreshAll();
  });
});

$("#answersPanel").addEventListener("submit", (event) => {
  event.preventDefault();
  runAction(event.submitter, async () => {
    requireApplication();
    const data = formData(event.currentTarget);
    await api("/api/chat-answers/submit-batch", {
      method: "POST",
      body: [
        answer("motivation", "Pourquoi ce poste vous motive ?", data.motivation),
        answer("technical_skills", "Quelles competences techniques avez-vous ?", data.skills),
        answer("projects", "Decrivez un projet pertinent.", data.project),
        answer("availability", "Quelle est votre disponibilite ?", data.availability)
      ]
    });
    await refreshAll();
  });
});

$("#analyzeButton").addEventListener("click", (event) => {
  runAction(event.currentTarget, async () => {
    requireApplication();
    state.lastAnalysis = await api(`/api/chat-answers/analyze/${state.applicationId}`);
    saveState();
    await refreshAll();
  });
});

$("#commentButton").addEventListener("click", (event) => {
  runAction(event.currentTarget, async () => {
    requireApplication();
    await api(`/api/applications/${state.applicationId}/comments`, {
      method: "POST",
      body: {
        body: $("#commentBody").value,
        visibility: "INTERNAL",
        mentions: []
      }
    });
    await refreshAll();
  });
});

$("#workerButton").addEventListener("click", (event) => {
  runAction(event.currentTarget, async () => {
    requireApplication();
    await api(`/api/applications/${state.applicationId}/tasks`, {
      method: "POST",
      body: {
        title: "Generer un resume profil",
        description: "Resume court pour preparation entretien.",
        assigneeId: FINDem_WORKER_ID,
        priority: "MEDIUM",
        taskType: "PROFILE_SUMMARY"
      }
    });
    setTimeout(refreshAll, 1600);
  });
});

$("#decisionInputButton").addEventListener("click", (event) => {
  runAction(event.currentTarget, async () => {
    requireApplication();
    const data = formData($("#decisionPanel"));
    await api(`/api/applications/${state.applicationId}/decision-inputs`, {
      method: "POST",
      body: {
        sentiment: data.sentiment,
        comment: data.inputComment,
        confidence: Number(data.confidence || 4)
      }
    });
    await refreshAll();
  });
});

$("#decisionPanel").addEventListener("submit", (event) => {
  event.preventDefault();
  runAction(event.submitter, async () => {
    requireApplication();
    const data = formData(event.currentTarget);
    state.decision = await api(`/api/applications/${state.applicationId}/decision`, {
      method: "POST",
      body: {
        finalStatus: "INTERVIEW",
        rationale: data.rationale
      }
    });
    saveState();
    await refreshAll();
  });
});

function answer(questionKey, questionText, answerText) {
  return {
    applicationId: state.applicationId,
    candidateId: state.candidateId,
    questionKey,
    questionText,
    answer: answerText,
    required: true
  };
}

function requireSession() {
  if (!state.token || !state.companyId || !state.recruiterId) {
    throw new Error("Cree ou connecte une session");
  }
}

function requireApplication() {
  requireSession();
  if (!state.applicationId) {
    throw new Error("Cree d'abord une candidature");
  }
}

$("#saveApiBase").addEventListener("click", () => {
  state.apiBase = elements.apiBase.value.replace(/\/$/, "");
  saveState();
});

$("#resetDemo").addEventListener("click", resetState);
$("#refreshButton").addEventListener("click", () => runAction($("#refreshButton"), refreshAll));
$("#clearLog").addEventListener("click", () => { elements.apiLog.textContent = ""; });
$("#copyState").addEventListener("click", async () => {
  const payload = JSON.stringify({
    apiBase: state.apiBase,
    companyId: state.companyId,
    recruiterId: state.recruiterId,
    jobId: state.jobId,
    candidateId: state.candidateId,
    applicationId: state.applicationId
  }, null, 2);
  await navigator.clipboard.writeText(payload);
});

$$(".step").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".step").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.target}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

$$(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    $$(".tab").forEach((item) => item.classList.remove("active"));
    $$(".view").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.view}`).classList.add("active");
  });
});

renderState();
renderCollections();
