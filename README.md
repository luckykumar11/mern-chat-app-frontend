# Talk-A-Tive Frontend

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Work+Sans&weight=700&size=26&duration=2400&pause=900&color=3B82F6&center=true&vCenter=true&width=860&lines=Talk-A-Tive+Frontend;React+%2B+Chakra+UI+Chat+Client;Realtime+Chat+%7C+Typing+%7C+Notifications" alt="Frontend animated heading" />
</p>

Frontend client for Talk-A-Tive.

## Stack

- React 17
- Chakra UI
- Axios
- Socket.IO client

## Prerequisites

- Node.js installed
- Backend running at http://localhost:5000

This client uses proxy:

- http://127.0.0.1:5000

## Install

From project root:

```bash
npm --prefix frontend install --legacy-peer-deps
```

Or inside frontend folder:

```bash
cd frontend
npm install --legacy-peer-deps
```

## Run

From project root:

```bash
npm --prefix frontend start
```

Or inside frontend folder:

```bash
cd frontend
npm start
```

Frontend URL:

- http://localhost:3000

## Production Build

```bash
npm --prefix frontend run build
```

## Main UI Features

- Login and signup flow
- One-to-one and group chats
- Real-time messaging + typing indicators
- Attachments (image/video/audio)
- Edit and unsend messages
- Notification bell + unread badges
- Per-chat unread counts
- Group sender names with theme-aware colors
- Message time labels:
  - just now
  - Xm ago (up to 10 minutes)
  - 12-hour exact time after 10 minutes

## Quick Troubleshooting

- API requests failing:
  - ensure backend is running on port 5000
- Peer dependency install error:
  - install with --legacy-peer-deps
- Startup issues:
  - remove frontend/node_modules and reinstall
