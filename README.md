## Overview

Krung Travel is a React single-page application built with **Vite**, **TypeScript**, and **Tailwind CSS**. It surfaces hand-picked Bangkok accommodations with search, property detail views, and AI-powered features backed by the **Google Generative AI SDK** (`@google/genai`).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [React 19](https://react.dev/) |
| Build tool | [Vite 8](https://vitejs.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Animations | [Motion](https://motion.dev/) (Framer Motion) |
| Icons | [Lucide React](https://lucide.dev/) |
| AI | [Google Generative AI SDK](https://www.npmjs.com/package/@google/genai) |
| Server framework | [Express](https://expressjs.com/) |

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A [Gemini API key](https://aistudio.google.com/apikey) for AI features

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set at minimum:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

> **Note:** `.env*` files are gitignored (except `.env.example`), so your local secrets won't be committed. AI Studio automatically injects `GEMINI_API_KEY` and `APP_URL` at runtime from user secrets when deployed.

### 3. Run the app

Start the Vite dev server on port 3000:

```bash
npm run dev
```

Open your browser to: **http://localhost:3000**

### Other available scripts

```bash
npm run dev     # Start dev server (port 3000, hot reload enabled)
npm run build   # Production build into ./dist
npm run preview # Preview the production build locally
npm run lint    # Type-check with tsc (noEmit)
npm run clean   # Remove dist/ and server.js
```

## Project Structure

```
krung-travel/
├── .vscode/
│   └── launch.json          # VS Code debug configurations
├── index.html               # HTML entry point
├── vite.config.ts           # Vite config (React + Tailwind plugins)
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies & scripts
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore rules
├── README.md                # This file
├── metadata.json            # AI Studio app metadata
├── src/
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global / Tailwind styles
│   ├── App.tsx              # App shell & routing
│   ├── data/
│   │   └── bangkokData.ts   # Bangkok property data
│   └── components/
│       ├── App.tsx
│       ├── HeroSection.tsx
│       ├── Navbar.tsx
│       ├── SearchBar.tsx
│       ├── StayCard.tsx
│       ├── PropertyDetail.tsx
│       └── CustomCursor.tsx
└── dist/                    # Production build output (gitignored)
```

## VS Code Debugging

A `.vscode/launch.json` is included with the following configurations:

| Configuration | Description |
|---------------|-------------|
| **Launch Chrome against localhost** | Starts `npm run dev`, then launches Chrome attached to the dev server |
| **Attach to Chrome** | Attaches VS Code to an already-running Chrome instance on port 9222 |
| **Debug Vite dev server (Node)** | Debugs the Vite dev server process directly |
| **Preview production build** | Starts `npm run preview` and launches Chrome |
| **Full Stack: Dev Server + Chrome** | Compound: dev server + Chrome launch |

Open the **Run and Debug** view in VS Code (`Ctrl+Shift+D`) and select a configuration to start debugging.

## Deployment

This app is designed to run in [Google AI Studio](https://ai.studio/). When deployed, `GEMINI_API_KEY` and `APP_URL` are injected automatically from the Secrets panel.

For a static production build:

```bash
npm run build
```

The output is emitted to `./dist` and can be served by any static host or Cloud Run.

## License

Private project — all rights reserved.
