/* ==========================================================================
   hammadrizvi.tech — Interactive Previews, Theme Toggle & Live GitHub Stats
   ========================================================================== */

const PROJECT_PREVIEWS = {
  "sql-journey": {
    eyebrow: "SQL · Automated GitHub Actions CI",
    title: "SQL-Journey (MySQL & SQLite)",
    summary:
      "Structured SQL problem-solving covering Joins, Aggregates, CTEs (WITH), Subqueries, and Business Analytics — tested automatically on every push via GitHub Actions.",
    highlights: [
      "28+ verified queries across Module 01 (Basics & Joins) and Module 02 (CTEs & Subqueries).",
      "Dual-dialect support: runnable anywhere with SQLite3 plus MySQL 8+ compatible scripts.",
      "Automated CI workflow runs every query on push and fails if any SQL error is introduced."
    ],
    code: `-- Verified Module 02 CTE: Employees earning above their department average
WITH dept_avg AS (
    SELECT department_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY department_id
)
SELECT e.first_name, e.last_name, d.department_name,
       e.salary, ROUND(da.avg_salary, 2) AS dept_avg_salary
FROM employees e
JOIN dept_avg da ON da.department_id = e.department_id
JOIN departments d ON d.department_id = e.department_id
WHERE e.salary > da.avg_salary
ORDER BY d.department_name, e.salary DESC;`,
    repoUrl: "https://github.com/hammadrizvi-dev/SQL-Journey"
  },
  "data-science-journey": {
    eyebrow: "Python · EDA & Visualization",
    title: "Data-Science-Journey",
    summary:
      "Clean, reproducible repository documenting core NumPy, Pandas, Matplotlib, Seaborn, and end-to-end exploratory data analysis projects.",
    highlights: [
      "Student Performance Analysis: 4-day end-to-end workflow (cleaning, outlier profiling, demographic correlation).",
      "IPL Cricket Analytics: ball-by-ball visualization notebooks using Matplotlib & Seaborn.",
      "Zero hardcoded local paths — every notebook runs cleanly using relative dataset paths."
    ],
    code: `# Student Performance Analysis — Composite Score & Prep Course Impact
import pandas as pd

df = pd.read_csv("../data/student_performance.csv")
df["avg_score"] = df[["math score", "reading score", "writing score"]].mean(axis=1)

summary = (
    df.groupby("test preparation course")["avg_score"]
      .agg(["count", "mean", "median"])
      .round(2)
)
print(summary)`,
    repoUrl: "https://github.com/hammadrizvi-dev/Data-Science-Journey"
  },
  "chatify": {
    eyebrow: "Full-Stack · Real-Time Web App",
    title: "Chatify — Real-Time Messaging App",
    summary:
      "WhatsApp-inspired real-time messaging platform built with Node.js, Express, MongoDB, Socket.IO, and secure JWT authentication.",
    highlights: [
      "Bi-directional instant messaging and live online status powered by Socket.IO.",
      "REST API with Express, MongoDB schemas (User, Message), and JWT-based route protection.",
      "Includes media upload middleware and a step-by-step DEPLOY_GUIDE.md."
    ],
    code: `// Socket.IO Real-Time Message Handler (socket/socketHandler.js)
io.on("connection", (socket) => {
  socket.on("join_room", (userId) => {
    socket.join(userId);
  });

  socket.on("send_message", async ({ senderId, receiverId, text }) => {
    const saved = await Message.create({ sender: senderId, receiver: receiverId, text });
    io.to(receiverId).emit("receive_message", saved);
  });
});`,
    repoUrl: "https://github.com/hammadrizvi-dev/Chatify"
  }
};

const CODE_SNIPPETS = {
  sql: `-- SQL-Journey · Module 02 (Verified by GitHub Actions CI)
WITH proj_hours AS (
    SELECT p.project_id, p.project_name, p.budget,
           SUM(ep.hours_worked) AS total_hours
    FROM projects p
    JOIN employee_projects ep ON ep.project_id = p.project_id
    GROUP BY p.project_id, p.project_name, p.budget
)
SELECT project_name, budget, total_hours,
       ROUND(1.0 * budget / total_hours, 2) AS budget_per_hour
FROM proj_hours
WHERE total_hours > 0
ORDER BY budget_per_hour DESC;`,
  python: `# Data-Science-Journey · Clean Relative Pipeline
import pandas as pd
import seaborn as sns

df = pd.read_csv("../data/student_performance.csv")
df["total_score"] = df["math score"] + df["reading score"] + df["writing score"]

# Parental education vs average performance
cohort = (
    df.groupby("parental level of education")["total_score"]
      .mean()
      .sort_values(ascending=False)
)
print(cohort.round(1))`,
  ci: `# .github/workflows/sql-ci.yml — Automated Verification on Every Push
name: SQL Verification CI
on: [push, pull_request]
jobs:
  verify-sqlite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update && sudo apt-get install -y sqlite3
      - run: |
          sqlite3 -bail test.db < 01-basics-and-joins/sqlite/01_schema_and_seed.sql
          sqlite3 -bail test.db < 01-basics-and-joins/sqlite/03_solutions.sql > /dev/null
          sqlite3 -bail test.db < 02-ctes-and-subqueries/sqlite/02_solutions.sql > /dev/null`
};

// 1. Theme Toggle (Light Editorial Paper <-> Dark Editorial Ink)
function initTheme() {
  const saved = localStorage.getItem("hr-theme") || "light";
  document.documentElement.setAttribute("data-theme", saved);
  updateThemeButton(saved);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("hr-theme", next);
      updateThemeButton(next);
    });
  });
}

function updateThemeButton(theme) {
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.textContent = theme === "dark" ? "☀" : "☾";
    btn.setAttribute("aria-label", theme === "dark" ? "Switch to light editorial theme" : "Switch to dark editorial theme");
  });
}

// 2. Project Filter Pills
function initFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll("[data-category]");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const cats = (card.dataset.category || "").split(" ");
        card.style.display = filter === "all" || cats.includes(filter) ? "flex" : "none";
      });
    });
  });
}

// 3. Interactive Preview Modal
function initModal() {
  const backdrop = document.getElementById("preview-modal");
  if (!backdrop) return;

  const eyebrowEl = backdrop.querySelector("[data-modal-eyebrow]");
  const titleEl = backdrop.querySelector("[data-modal-title]");
  const summaryEl = backdrop.querySelector("[data-modal-summary]");
  const listEl = backdrop.querySelector("[data-modal-list]");
  const codeEl = backdrop.querySelector("[data-modal-code]");
  const repoEl = backdrop.querySelector("[data-modal-repo]");

  document.querySelectorAll("[data-preview]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const key = trigger.dataset.preview;
      const item = PROJECT_PREVIEWS[key];
      if (!item) return;

      eyebrowEl.textContent = item.eyebrow;
      titleEl.textContent = item.title;
      summaryEl.textContent = item.summary;
      listEl.innerHTML = item.highlights.map((h) => `<li>${h}</li>`).join("");
      codeEl.textContent = item.code;
      repoEl.href = item.repoUrl;
      backdrop.classList.add("open");
    });
  });

  const closeModal = () => backdrop.classList.remove("open");
  backdrop.querySelectorAll("[data-modal-close]").forEach((btn) => btn.addEventListener("click", closeModal));
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// 4. Homepage Code Switcher & Copy Button
function initCodeWindow() {
  const codeBody = document.getElementById("live-code-body");
  if (!codeBody) return;

  let activeKey = "sql";
  codeBody.textContent = CODE_SNIPPETS[activeKey];

  document.querySelectorAll(".code-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".code-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeKey = tab.dataset.snippet;
      codeBody.textContent = CODE_SNIPPETS[activeKey];
    });
  });

  const copyBtn = document.getElementById("copy-snippet-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(CODE_SNIPPETS[activeKey]);
        copyBtn.textContent = "Copied ✓";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      } catch {
        copyBtn.textContent = "Copy failed";
      }
    });
  }
}

// 5. Live GitHub Telemetry (graceful fallback if API rate-limited)
async function initGitHubStats() {
  const repoCountEl = document.getElementById("gh-repo-count");
  if (!repoCountEl) return;
  try {
    const res = await fetch("https://api.github.com/users/hammadrizvi-dev");
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.public_repos === "number") {
      repoCountEl.textContent = data.public_repos;
    }
  } catch {
    // Keep clean static fallback
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFilters();
  initModal();
  initCodeWindow();
  initGitHubStats();
});
