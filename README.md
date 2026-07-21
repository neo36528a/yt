# Ultra Video Downloader

A premium, modern video downloader web application built with Next.js 15, React 19, and TypeScript. Features a stunning dark glassmorphism UI inspired by Apple, Spotify, and Discord.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

---

## ✨ Features

- **Premium UI** — Glassmorphism dark theme with particle animations, gradient effects, and micro-interactions
- **Video Analysis** — Paste a URL and get video metadata (title, thumbnail, duration, available formats)
- **Multiple Formats** — Download as MP4, WEBM, MP3, or M4A
- **Resolution Selection** — Choose from 144p up to 2160p (4K)
- **Download Queue** — Queue multiple downloads with concurrent download limiting
- **Progress Tracking** — Real-time progress bar with speed, ETA, and downloaded size
- **Pause/Resume/Cancel** — Full download lifecycle control
- **Download History** — Searchable, filterable history with grid/list views
- **Settings** — Configurable download folder, speed limits, themes, and more
- **Security** — URL validation, rate limiting, input sanitization, command injection prevention
- **Responsive** — Fully responsive design, mobile-friendly
- **Keyboard Shortcuts** — Ctrl+V paste, Ctrl+D download, Esc cancel

---

## 🛡️ Legal & Ethical Use

This application only supports downloading from:
- **Direct media file URLs** (MP4, WebM, etc.)
- **Publicly accessible videos** from websites that permit downloading
- **Your own content** that you've uploaded

This application does **NOT**:
- Bypass DRM or copy protection
- Circumvent paywalls or login requirements
- Violate any website's terms of service
- Download copyrighted content without authorization

---

## 🚀 Prerequisites

Before running Ultra Video Downloader, ensure you have:

| Requirement | Version | Installation |
|-------------|---------|-------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **yt-dlp** | Latest | `pip install yt-dlp` or [GitHub releases](https://github.com/yt-dlp/yt-dlp/releases) |
| **FFmpeg** | Latest | [ffmpeg.org](https://ffmpeg.org/download.html) or `choco install ffmpeg` (Windows) |

### Verify Installation

```bash
node --version    # Should be 18+
yt-dlp --version  # Should output version
ffmpeg -version   # Should output version
```

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ultra-video-downloader
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | Zustand |
| Data Fetching | TanStack Query (React Query) |
| HTTP | Axios |
| Icons | Lucide React |
| Database | SQLite (better-sqlite3) |
| Download Engine | yt-dlp + FFmpeg |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── analyze/       # POST - Analyze video URL
│   │   ├── download/      # POST - Start download (SSE)
│   │   ├── history/       # GET - Download history
│   │   ├── delete/        # DELETE - Remove history
│   │   └── settings/      # GET/PUT - App settings
│   ├── history/           # History page
│   ├── settings/          # Settings page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # Client providers
│   └── globals.css        # Global styles
├── components/
│   ├── home/              # Home page components
│   ├── history/           # History components
│   ├── layout/            # Navbar, Footer
│   └── ui/                # Reusable UI primitives
├── hooks/                 # Custom React hooks
├── lib/                   # Backend utilities
│   ├── database.ts        # SQLite operations
│   ├── downloader.ts      # yt-dlp wrapper
│   ├── queue.ts           # Download queue
│   ├── validator.ts       # Security & validation
│   ├── utils.ts           # Helper functions
│   └── constants.ts       # App constants
├── store/                 # Zustand state stores
└── types/                 # TypeScript definitions
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Analyze a video URL |
| POST | `/api/download` | Start download (SSE stream) |
| GET | `/api/history` | Get download history |
| DELETE | `/api/delete` | Delete history item(s) |
| GET/PUT | `/api/settings` | Read/update settings |

---

## 🚀 Deployment

### Build for production

```bash
npm run build
npm start
```

### Docker (optional)

```dockerfile
FROM node:20-alpine
RUN apk add --no-cache python3 py3-pip ffmpeg
RUN pip3 install yt-dlp
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Troubleshooting: YouTube "Sign in to confirm you're not a bot"

If YouTube returns `Sign in to confirm you're not a bot` when deploying to cloud platforms (Render, Railway, Fly.io, Vercel, Docker):

1. **Automatic Mobile Client Extractor (Built-in)**:
   - Ultra Video Downloader automatically uses `--extractor-args "youtube:player_client=ios,web,mweb"` to route requests through YouTube's mobile API, bypassing web bot checks.

2. **Providing YouTube Cookies (Optional for restricted videos)**:
   - Export your YouTube cookies using a browser extension like **Get cookies.txt LOCALLY** (Chrome/Firefox).
   - Place `cookies.txt` in `./cookies.txt` or `./data/cookies.txt`.
   - **For Cloud Services**: Set the `YOUTUBE_COOKIES` environment variable with the raw contents of your `cookies.txt` file (or base64 encoded string prefixed with `base64:`).


---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+V` | Paste URL |
| `Ctrl+D` | Start download |
| `Ctrl+K` | Search |
| `Ctrl+,` | Open settings |
| `Esc` | Cancel / Close |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
