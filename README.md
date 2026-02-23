# 👨‍💻 Dev Colab — Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-1E1E1E?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![tldraw](https://img.shields.io/badge/tldraw-1D1D1D?style=for-the-badge&logo=canvas&logoColor=white)

**A modern, AI-powered collaboration platform for developers.**

</div>

---

## ✨ Features

### 🎬 Landing Page
- **Animated Loading Screen** — Cinematic intro with logo animation before content reveal
- **Photo Collage** — Scrolling marquee columns of collaboration-themed images with parallax and hover effects
- **Hero Content** — Bold headline with animated text, CTA buttons, and gradient overlays
- **Scroll Indicator** — Animated chevron guiding users to scroll down

### 🔐 Authentication & Navigation
- **Secure Login/Signup** — JWT-based auth with `localStorage` persistence (access + refresh tokens)
- **Auto-Redirect** — Dashboard redirects to `/profile/create` if profile is incomplete
- **TopBar** — Animated navigation bar with gold accents, profile dropdown (Profile + Logout)
- **Logout** — Clears all tokens and session data, redirects to `/login`

### 📊 Dashboard
- **Profile Completeness Check** — Redirects new users to `/profile/create` if key fields are missing
- **Recent Projects** — Shows the user's 3 most recent projects with status badges
- **Mission Invites** — Displays pending team invitations with accept/reject actions
- **Hero Section** — Full-width background image with greeting and project stats

### 👤 Profile Management
- **Multi-step Profile Wizard** — 4-step form: Personal Info → Skills & Interests → Social Links → Review
- **Validation** — All fields required except bio, GitHub, LinkedIn, and portfolio
- **Profile View** — View own profile with skills, experience level, interests, languages, and social links
- **Public Profiles** — View other users' profiles by username (`/profile/[username]`)
- **Edit Profile** — Update profile with Autocomplete dropdowns for skills, interests, and languages

### 🚀 Projects & AI Planning
- **Create Project** — Multi-step wizard with title, description, skills, features, team size, complexity, and duration
- **Explore Projects** — Browse all projects with tab switching (My Projects / Explore)
- **Semantic Search** — Find projects using natural language (e.g., "chat app with AI") via Pinecone vectors
- **Project Detail** — Full project view with description, required skills, team members, and status
- **AI Project Planner** — Generates roadmaps with sprints and tasks using LangGraph agent
- **Kanban Board** — Task cards organized by status (To Do / In Progress / Done)
- **Sprint Timeline** — Visual sprint progression with date ranges and current sprint highlighting
- **Sprint Locking** — Past sprints auto-lock; tasks in locked sprints are read-only
- **Task Status Updates** — Click to cycle task status with instant backend sync
- **Request to Join** — Users can request to join projects; button disables if already a member

### 🤖 AI Team Formation
- **Team Recommendations Modal** — AI analyzes project and recommends ideal teammates
- **Candidate Cards** — Shows match score, reasoning, skills, and role for each candidate
- **Send Invitation** — Invite recommended candidates directly from the modal

### 👥 Teams & Invitations
- **Teams Page** — List all teams the user belongs to with member details
- **Invitations Page** — View and respond to pending team invitations
- **Join Requests** — Project owners can view and accept/reject join requests

### 💻 Live Collaboration Sessions
- **Session List** — Shows all active coding rooms where user is a member
- **Create Session** — Requires an AI-generated project plan before starting
- **Monaco Code Editor** — Full-featured editor with syntax highlighting, multi-file support, and auto-layout
- **File Explorer** — Create, delete, rename files and directories with tree view
- **File Tabs** — Multi-tab file switching with close buttons and gold active indicators
- **Code Execution** — Run code in 12+ languages via self-hosted Piston (Docker)
- **Console Output** — Expandable console panel with compile/runtime error handling
- **Whiteboard** — Shared tldraw infinite canvas for brainstorming and system design
- **Team Chat** — Real-time messaging with sender usernames and timestamps
- **Live Presence** — Shows connected users with online count badge
- **Interactive Avatar** — 3D-style robot companion that reacts to UI interactions
- **Cinema Mode** — Immersive "Smoky Deep Gold Frost" glassmorphism UI for focused work

### 🎨 Design System
- **Dark Glassmorphism** — `#050505` background with `rgba` glass panels and gold `#D4AF37` accents
- **Distorted Background** — Fixed background with collaboration images, noise overlay, and animated gold glows
- **Consistent Theming** — Autocomplete dropdowns, inputs, and cards all match dark glass theme
- **Animations** — Framer Motion page transitions, hover effects, and micro-interactions
- **Responsive** — Mobile-friendly layouts with MUI Grid and Stack

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Material UI (MUI)](https://mui.com/) + [Emotion](https://emotion.sh/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`)
- **API Client**: [Axios](https://axios-http.com/) with interceptors
- **Forms**: [react-hook-form](https://react-hook-form.com/) with validation rules
- **Icons**: [MUI Icons](https://mui.com/material-ui/material-icons/)
- **Whiteboard**: [tldraw](https://tldraw.com/)
- **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`)
- **Real-time**: [Socket.IO Client](https://socket.io/)
- **Fonts**: Space Grotesk (via `@fontsource`), Geist, Geist Mono

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── login/           # Login page
│   │   │   └── signup/          # Registration page
│   │   ├── dashboard/           # Main user dashboard
│   │   ├── projects/            # Project listing & creation
│   │   │   ├── [id]/            # Project details (Roadmap, Kanban, Team)
│   │   │   └── create/          # Project creation wizard
│   │   ├── room/                # Live coding sessions
│   │   │   └── [roomId]/        # Active session (Editor, Whiteboard, Chat)
│   │   ├── profile/             # User profile management
│   │   │   ├── [username]/      # Public profile view
│   │   │   └── create/          # Multi-step profile creation wizard
│   │   ├── sessions/            # Session listing page
│   │   ├── teams/               # Teams listing page
│   │   ├── invitations/         # Invitations inbox
│   │   ├── globals.css          # Global CSS variables & base styles
│   │   └── layout.tsx           # Root layout & ThemeContext provider
│   │
│   ├── components/
│   │   ├── Collaboration/       # Real-time collaboration components
│   │   │   ├── CodeEditor.tsx   # Monaco editor with run button & console
│   │   │   ├── FileExplorer.tsx # File tree with CRUD operations
│   │   │   ├── FileTabs.tsx     # Multi-tab file switching
│   │   │   ├── Chat.tsx         # Real-time team chat
│   │   │   └── Whiteboard.tsx   # Shared tldraw canvas
│   │   ├── landing/             # Landing page components
│   │   │   ├── HeroContent.tsx  # Hero text & CTA
│   │   │   ├── PhotoCollage.tsx # Scrolling image collage
│   │   │   ├── LoadingScreen.tsx# Animated intro screen
│   │   │   └── ScrollIndicator.tsx
│   │   ├── shared/              # Shared UI components
│   │   │   ├── TopBar.tsx       # Navigation bar with profile menu
│   │   │   ├── DistortedBackground.tsx # Fixed background with effects
│   │   │   └── AILoadingAnimation.tsx  # AI agent loading states
│   │   ├── projects/            # Project-specific components
│   │   │   └── ProjectCard.tsx  # Project card with status & skills
│   │   ├── InteractiveAvatar.tsx # 3D robot companion
│   │   └── TeamRecommendationsModal.tsx # AI team formation modal
│   │
│   ├── context/
│   │   ├── FileContext.tsx      # File system state for code editor
│   │   └── ThemeContext.tsx     # MUI dark/light theme provider
│   │
│   ├── services/
│   │   └── socketService.ts    # Socket.IO client (connect, emit, on, executeCode)
│   │
│   ├── utils/
│   │   ├── api.ts              # Axios instance with auth interceptors
│   │   ├── projectApi.ts       # Project, invitation, join request APIs
│   │   ├── profileApi.ts       # Profile CRUD & identity APIs
│   │   ├── teamFormationApi.ts # AI team formation API
│   │   └── fileUtils.ts        # File system helpers, language mapping, Piston mapping
│   │
│   └── types/
│       └── fileTypes.ts        # FileSystemItem, Id types
│
├── public/
│   └── svg/                    # SVG assets
├── package.json
└── next.config.ts
```

---

## 🚀 Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment** (`.env.local`):
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8000
    NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🔗 Key Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with photo collage & hero |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | User dashboard (projects + invites) |
| `/projects` | Browse all projects (My Projects / Explore tabs) |
| `/projects/create` | Create a new project |
| `/projects/[id]` | Project details, roadmap, Kanban, team |
| `/profile` | Authenticated user's profile |
| `/profile/create` | Multi-step profile creation wizard |
| `/profile/[username]` | Public profile view |
| `/sessions` | List active coding sessions |
| `/room/[roomId]` | Live collaboration (editor, whiteboard, chat) |
| `/teams` | Teams listing |
| `/invitations` | Invitation inbox |

---

## 📝 License

MIT © 2026

---

<div align="center">

**Built with ❤️ using Next.js**

</div>
