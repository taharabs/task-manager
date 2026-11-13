<div align="center">

# 📝 Notion-Style Task Manager

**A fast, dependency-free task manager with four views and a built-in smart assistant — all in the browser.**

[![Live demo](https://img.shields.io/badge/▶%20Live%20demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://task-manager-snowy-two.vercel.app)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No dependencies](https://img.shields.io/badge/dependencies-0-success?style=for-the-badge)

</div>

---

## ✨ Features

| | |
|---|---|
| 🗂️ **4 views** | Kanban **board** (Todo · In Progress · Done), **list**, **table** and **calendar** |
| 🖱️ **Drag & drop** | Move tasks between columns on the board |
| 🎯 **Priorities, tags & due dates** | Filter and search across all of them |
| 🤖 **Smart assistant** | Understands natural dates (*"tomorrow"*, *"next friday"*, *"end of month"*), suggests priority and tags from the task title, cleans up titles and gives productivity insights |
| 🔎 **Smart search** | Search by text, tag, status or priority |
| 🔔 **Notifications** | Reminders for upcoming deadlines |
| 💾 **Persistence** | Saved in `localStorage` — no account, no server |
| 🌙 **Dark mode** | |

> The assistant is **rule-based and runs 100% locally** — no API key, no data leaves the browser.

## 🏗️ Architecture

```
index.html   → layout, views, modals
style.css    → Notion-inspired design system, dark mode
script.js    → two classes
               ├── TaskManager   state, CRUD, rendering of the 4 views, drag & drop, storage
               └── AIAssistant   date parsing, priority/tag suggestions, insights, query handling
```

## 🚀 Run locally

```bash
git clone https://github.com/taharabs/task-manager.git
cd task-manager
npx serve .        # or simply open index.html in your browser
```

## 🧭 Roadmap
- [ ] Split `script.js` into ES modules + unit tests (Vitest)
- [ ] Export / import tasks as JSON / CSV
- [ ] Optional sync backend (FastAPI + PostgreSQL)
- [ ] Optional LLM mode for the assistant

## 📸 Screenshots
<!-- Add screenshots to docs/ and reference them here, e.g. ![Board view](docs/board.png) -->

---

<div align="center">

Built by [Mohamed Tahar Ababsa](https://github.com/taharabs) · [Portfolio](https://techbytahar.vercel.app) · [LinkedIn](https://www.linkedin.com/in/mohamed-tahar-ababsa)

</div>
