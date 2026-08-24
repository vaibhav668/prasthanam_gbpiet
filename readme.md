# Forge Web Application

Forge is a modern web application designed for developer and tech communities to collaborate, discuss ideas, and share knowledge. Built as a high-performance standalone React application with TypeScript, TailwindCSS, and Radix UI.

## Features

- **Public Club Showcase**: Landing page with club mission, stats counters, circular team carousel, upcoming events, and past reports.
- **Forum & Discussions**: Topic-based threads, rich multi-image previews, reply threads, and emoji reactions (`❤️`, `🔥`, `👍`, `🎉`, etc.).
- **Interactive Chatrooms**: Live chat channels with message logs, cross-tab synchronization (`BroadcastChannel`), live typing indicators, and simulated teammate responses.
- **Developer Profiles**: User profiles with custom avatars, display names, and bio editing.
- **Zero-Config Authentication**: 1-Click Demo Sign-In with developer profiles and guest access — no backend or database required.
- **Persistent Local State**: All threads, replies, reactions, chat messages, and user changes are preserved in browser storage (`localStorage`).

## Tech Stack

- **Framework**: React (v19) & Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS (v4), Lucide React
- **State & Data**: Zustand, TanStack Query (React Query v5), Local Storage DB
- **UI Primitives**: Radix UI (Dialog, Dropdown, Avatar, ScrollArea, Tabs, Tooltip)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Setup & Run

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

   The application will be live at `http://localhost:5173`.

4. **Build for Production:**
   ```bash
   npm run build
   ```

## License
MIT