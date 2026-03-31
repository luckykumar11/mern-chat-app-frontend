# Talk-A-Tive Frontend

React client for Talk-A-Tive chat app.

## Tech Stack

- React 17 (CRA)
- Chakra UI
- Axios
- Socket.IO client (non-serverless runtime)
- Ably client (serverless-friendly realtime)

## Environment Variables

Create frontend/.env (or copy from frontend/.env.example):

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_ENABLE_SOCKET=true
REACT_APP_ABLY_KEY=your_ably_key
```

Recommended production setup (frontend on Vercel + backend on Vercel):

```env
REACT_APP_API_URL=https://your-backend.vercel.app
REACT_APP_SOCKET_URL=https://your-backend.vercel.app
REACT_APP_ENABLE_SOCKET=false
REACT_APP_ABLY_KEY=your_ably_key
```

Notes:

- Do not add trailing slash in URLs.
- If ABLY key includes special characters, keep env value exactly as provided.

## Install

From repository root:

```bash
npm --prefix frontend install --legacy-peer-deps
```

Or from frontend directory:

```bash
cd frontend
npm install --legacy-peer-deps
```

## Run Locally

From repository root:

```bash
npm --prefix frontend start
```

Or from frontend directory:

```bash
cd frontend
npm start
```

Default URL: http://localhost:3000

## Build

```bash
npm --prefix frontend run build
```

## Features

- Login and signup
- One-to-one and group chats
- Typing indicators inside chat stream
- Media attachments (image/video/audio)
- Edit and unsend messages
- Notification bell with unread count
- Per-chat unread badges
- Unread persistence across refresh
- Session-expiry auto logout and redirect to login page

## Realtime Modes

- Local/non-serverless backend:
  - Set REACT_APP_ENABLE_SOCKET=true to use Socket.IO.
- Serverless backend (for example Vercel):
  - Set REACT_APP_ENABLE_SOCKET=false.
  - Use Ably key for realtime message + notification updates.

## Vercel Setup

- Framework preset: Create React App
- Build command: npm run build
- Output directory: build
- Install command: npm install --legacy-peer-deps
- Add all REACT_APP_* env vars in Production and Preview scopes.

## Troubleshooting

- Frontend not calling backend:
  - Verify REACT_APP_API_URL and backend health route.
- Repeated socket polling errors on Vercel:
  - Set REACT_APP_ENABLE_SOCKET=false.
- Realtime delay on Vercel:
  - Ensure REACT_APP_ABLY_KEY is set and backend has ABLY_API_KEY.
- Dependency install issues:
  - Reinstall using --legacy-peer-deps.
