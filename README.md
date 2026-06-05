# TaskFlow — Frontend

Next.js frontend for TaskFlow — a real-time collaborative kanban board.

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Ant Design 6** — UI components
- **Redux Toolkit** + **Redux Persist** — global state
- **Axios** — HTTP client with JWT interceptor
- **Socket.io Client 4** — real-time updates
- **@dnd-kit** — drag and drop for kanban cards

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- Backend server running (see `TaskFlow-backend/README.md`)

### Installation

```bash
cd TaskFlow-frontend
npm install
```

### Environment Variables

Create a `.env` file in the root of `TaskFlow-frontend`:

```env
NEXT_PUBLIC_BACKEND_API=http://localhost:8080/api/v1
```

> This is the only env variable you need. The socket connection automatically extracts the origin (`http://localhost:8080`) from this URL.

### Run the dev server

```bash
npm run dev
```

App opens at `http://localhost:3000`

### Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
TaskFlow-frontend/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (Redux provider, Antd config)
│   │   ├── RootLayout.tsx          # HTML shell + font
│   │   │
│   │   ├── (auth)/
│   │   │   └── sign-in/page.tsx    # Login page
│   │   │
│   │   └── (dashboard)/
│   │       ├── layout.tsx          # Dashboard layout (sidebar + auth guard)
│   │       └── (board)/
│   │           ├── board/
│   │           │   ├── page.tsx          # Board list + quick-create modal
│   │           │   └── action/page.tsx   # Create / edit board page
│   │           └── kanban/page.tsx       # Kanban board with drag and drop
│   │
│   ├── api/
│   │   ├── apiClient.ts            # Axios instance + JWT interceptor + token refresh
│   │   ├── apiHandler.ts           # All API call functions grouped by resource
│   │   └── Query.ts                # API endpoint path constants
│   │
│   ├── components/
│   │   └── Sidebar.tsx             # Navigation sidebar
│   │
│   ├── hooks/
│   │   └── useSocket.ts            # Socket.io connection hook
│   │
│   ├── redux/
│   │   ├── slices/
│   │   │   ├── authSlice.ts        # User auth state (user, accessToken)
│   │   │   └── boardSlice.ts       # Active board state (columns + cards)
│   │   └── store/
│   │       ├── index.ts            # Redux store with persist config
│   │       ├── rootReducer.ts      # Combined reducers
│   │       └── ReduxProvider.tsx   # Client-side Redux provider wrapper
│   │
│   ├── types/
│   │   └── index.d.ts              # TypeScript interfaces (User, Board, Column, Card)
│   │
│   ├── constants/
│   │   ├── index.ts                # Priority colors, pagination defaults
│   │   └── routes.ts               # App route constants
│   │
│   └── utils/
│       └── helpers.ts              # Toast helper, pagination param builder
```

---

## Features

### Boards
- Create, edit, and delete boards
- Add members using a searchable user dropdown (searches by name or email)
- Boards list with member count

### Kanban Board
- Columns with drag-and-drop card ordering using `@dnd-kit`
- Add, edit, and delete columns
- Add, edit, and delete cards
- Card fields: title, description, priority (Low / Medium / High / Urgent), due date, assignee
- Assignee shows avatar initials on the card

### Real-time
- All changes (create, update, delete, move) sync live to all users on the same board via Socket.io
- The user who made the change does not receive their own event back (no duplicate updates)
- If the socket disconnects and reconnects, the board data is automatically re-fetched

### Auth
- JWT-based login with 15-minute access tokens
- Refresh token (7-day, httpOnly cookie) auto-refreshes in the background
- Multiple concurrent requests that expire at the same time share a single refresh call — no race conditions
- On session expiry the user is redirected to sign-in once, cleanly

---

## Key Implementation Notes

### Token refresh (apiClient.ts)
A module-level `refreshPromise` ensures only one `POST /refresh-token` call goes out at a time even if many requests fail with 401 simultaneously. This prevents the "token reuse detected" race condition on the backend.

### Socket connection (useSocket.ts)
- Uses `transports: ["websocket"]` and `autoConnect: false` with a deferred `setTimeout(() => socket.connect(), 0)` to avoid the "WebSocket closed before connection established" warning that React StrictMode triggers in development.
- The socket URL is the origin of `NEXT_PUBLIC_BACKEND_API` (e.g. `http://localhost:8080`), not the full API path. Passing the full path would make Socket.IO interpret `/api/v1` as a namespace.

### Redux Persist
User auth state (name, email, access token) is persisted to `localStorage` so the user stays logged in on page refresh. Board state is not persisted — it's fetched fresh each time the kanban page loads.

---

## Pages Overview

| Route | Description |
|---|---|
| `/sign-in` | Login page |
| `/board` | List of all your boards |
| `/board/action` | Create a new board |
| `/board/action?id=<id>` | Edit an existing board |
| `/kanban?id=<id>` | Kanban view for a specific board |

---

## Common Issues

**Socket not connecting?**
Make sure the backend is running and `NEXT_PUBLIC_BACKEND_API` points to the correct URL. The socket connects to the base origin, not the `/api/v1` path.

**Drag and drop not working?**
Cards need a `columnId` and `order`. If you are seeing weird behaviour after a lot of moves, refresh the page — the board re-fetches from the server.

**"Session expired" on every page load?**
Your access token probably expired and the refresh token cookie is missing. Sign in again. Make sure the backend is sending the `Set-Cookie` header (`withCredentials: true` is already set on the Axios client).
