# 👨‍💻 Dev Colab — Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

**A modern, AI-powered collaboration platform for developers.**

</div>

---

## ✨ Features

### 🔐 Authentication & Navigation
- **Auto-Navigation** — Redirects to `/dashboard` if logged in, otherwise `/login`.
- **Secure Login/Signup** — JWT-based authentication with `localStorage` persistence.
- **Protected Routes** — Middleware/HOC protection for authenticated pages.

### 📊 Dashboard
- **Real-time Data** — Fetches user's projects from the backend API.
- **Project Stats** — Visualizes project progress, sprint status, and team size.
- **Empty States** — Guides new users to create their first project.

### 🚀 Projects & AI Planning
- **Create Project** — Multi-step wizard to define project scope and requirements.
- **AI Project Planner** (New!) — Generates detailed roadmaps with sprints and tasks.
- **Semantic Search** (New!) — Find projects using natural language queries (e.g., "chat app with AI") via Pinecone vectors.
- **Kanban Board** — Drag-and-drop task management.
- **Roadmap View** — Timeline view of project milestones.

### 👥 Team Collaboration
- **Team Formation** — AI-powered teammate recommendations based on skills.
- **Invitations** — Send and receive team invitations.
- **Join Requests** — Browse projects and request to join.

### 💻 Live Sessions
- **Coding Rooms** — Dedicated workspace for active projects.
- **Real-time Code Execution** — Run code directly in the browser (powered by Piston).
- **Cinema Mode** — Immersive "Smoky Deep Gold Frost" UI for focused work.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Material UI (MUI)](https://mui.com/) + [Emotion](https://emotion.sh/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [MUI Icons](https://mui.com/material-ui/material-icons/)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Authentication routes (login, signup)
│   │   ├── dashboard/          # Main user dashboard
│   │   ├── projects/           # Project listing & creation
│   │   │   ├── [id]/           # Project details (Roadmap, Kanban)
│   │   │   └── create/         # Project creation wizard
│   │   ├── profile/            # User profile management
│   │   ├── invitations/        # Team invitations
│   │   ├── sessions/           # Live coding sessions
│   │   └── layout.tsx          # Root layout & providers
│   │
│   ├── components/
│   │   ├── common/             # Reusable UI components
│   │   ├── projects/           # Project-specific components (RoadmapView)
│   │   └── TeamRecommendationsModal.tsx
│   │
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Dark/Light mode theme
│   │
│   ├── theme/
│   │   └── theme.ts            # MUI theme configuration
│   │
│   ├── utils/
│   │   ├── api.ts              # Axios instance & interceptors
│   │   └── projectApi.ts       # Project-related API endpoints
│   │
│   └── types/                  # TypeScript interfaces
│
├── public/                     # Static assets
└── package.json                # Dependencies
```

---

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔗 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page (auto-redirects) |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | User dashboard |
| `/projects` | Explore all projects |
| `/projects/create` | Create a new project |
| `/projects/[id]` | Project details & roadmap |
| `/profile` | User profile |
| `/sessions` | Live coding sessions |

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
