# Kizuna — Live Manga Chapter Chat

A web app where anime/manga readers get matched for a live 1-on-1 chat in the 15-minute window after a chapter drops.

## Quick Start (Local Development)

### 1. Prerequisites

- Node.js 18+
- npm or yarn

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

**For local development with Supabase** (optional):
1. Create a free Supabase project at [supabase.com](https://supabase.com)
2. Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Add them to `.env.local`

For **offline mode** (no database), leave Supabase vars commented out. Users will be stored in localStorage.

### 4. Run Both Frontend & Server

```bash
npm run dev:all
```

This starts:
- **Frontend** at `http://localhost:3000`
- **Socket.io Server** at `http://localhost:3001`

Or run separately:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Server
npm run dev:server
```

### 5. Test the App

1. Open two browser tabs to `http://localhost:3000`
2. Click a chapter card (e.g., "Blue Lock")
3. Create usernames and pick mangas on both
4. Both should get matched → see scene reveal → live chat

---

## Project Structure

```
kizuna/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── chapter/[slug]/page.tsx   # Chapter landing
│   ├── onboard/page.tsx          # Onboarding (username + taste picker)
│   ├── queue/[chapterId]/page.tsx # Waiting room
│   └── chat/[roomId]/page.tsx    # Live chat (merged into queue for now)
├── components/
│   ├── SceneReveal.tsx           # 4-second panel reveal
│   ├── LiveChat.tsx              # Socket.io chat UI
│   ├── AnimePicker.tsx           # AniList-powered tile picker
│   ├── ChapterCard.tsx           # Chapter tile
│   └── QueueStatus.tsx           # Waiting room indicator
├── lib/
│   ├── socket.ts                 # Socket.io client singleton
│   ├── supabase.ts               # Supabase client + queries
│   ├── anilist.ts                # AniList GraphQL queries
│   ├── releases.ts               # Release data loader
│   └── matching.ts               # (Matching logic is in server/queue.ts)
├── server/
│   ├── index.ts                  # Socket.io + Express server
│   └── queue.ts                  # In-memory queue + matching algorithm
├── data/
│   └── releases.json             # 20 series with chapter info
└── public/                        # Static files (panels, etc.)
```

---

## How the App Works

### User Journey

1. **Landing Page** (`/`)
   - Browse featured chapters
   - See live reader counts (updated via Socket.io)

2. **Chapter Page** (`/chapter/[slug]`)
   - Show chapter info, release schedule
   - Live reader count
   - CTA: "I just read it"

3. **Onboarding** (`/onboard`)
   - Set username (3-16 chars, letters/numbers)
   - Pick 5 favorite manga from AniList
   - Stored in localStorage + Supabase (if available)

4. **Queue** (`/queue/[chapterId]`)
   - Show waiting status
   - Socket.io listens for `matched` event
   - On match: receive room ID + partner info

5. **Scene Reveal** (Modal in queue page)
   - Full-screen image for 4 seconds
   - Countdown timer + progress bar
   - Both users must confirm ready

6. **Live Chat** (Modal in queue page)
   - Socket.io real-time messages
   - Skip or Save partner button
   - Emoji reaction on exit

---

## API & Socket Events

### Socket.io Events (Client → Server)

```typescript
socket.emit('join_queue', { userId, username, chapterId, tasteProfile })
socket.emit('scene_ready', { roomId })
socket.emit('send_message', { roomId, text, userId })
socket.emit('skip', { roomId, userId })
socket.emit('save_contact', { roomId, userId, partnerId })
socket.emit('session_end', { roomId, userId, emoji })
```

### Socket.io Events (Server → Client)

```typescript
socket.on('queued', { chapterId, queuePosition })
socket.on('matched', { roomId, partnerId, partnerName, chapterId, panelImage })
socket.on('message', { text, from, timestamp })
socket.on('partner_skipped')
socket.on('partner_saved_you')
socket.on('typing') // Future
```

### REST Endpoints

```
GET /health           # Server status
GET /queues          # All queue sizes by chapter
```

---

## Matching Algorithm

**File:** `server/queue.ts` → `overlapScore()` function

```typescript
function overlapScore(a: string[], b: string[]): number {
  const setA = new Set(a);
  const intersection = b.filter(x => setA.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}
```

**Matching Rules:**
1. When user joins queue for chapter X, check if anyone else is waiting for X
2. If yes:
   - Calculate **Jaccard similarity** between their taste profiles
   - If overlap score > 0 **OR** person waited > 20s → **Match!**
3. If no → Add to queue, set 30s timeout

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Real-time**: Socket.io client + server
- **Data**: 
  - localStorage (client-side only, no backend config)
  - Supabase Postgres (optional)
- **Anime Data**: AniList GraphQL API (free, no key needed)
- **Deployment Ready**: Vercel (frontend) + Railway/Render (server)

---

## Next Steps (TODO)

### Day 2 (Scene & Chat refinement)
- [ ] Fetch real panel images from AniList or Firebase Storage
- [ ] Add typing indicator socket event
- [ ] Improve UUID generation for offline mode
- [ ] Better error handling & reconnection

### Day 3 (Deployment)
- [ ] Deploy Next.js frontend to Vercel
- [ ] Deploy Socket.io server to Railway or Render
- [ ] Set production Supabase keys in env
- [ ] Add Supabase migrations (see `SCHEMA.sql` below)
- [ ] Test with two real browser tabs

### Polish (if time)
- [ ] Emoji reactions feedback
- [ ] Profile page with saved contacts
- [ ] Session history
- [ ] Rate limiting on queue joins
- [ ] Better mobile responsiveness

---

## Supabase Schema (Optional)

If using Supabase, run these migrations:

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  taste_profile text[] default '{}',
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references users(id),
  user_b uuid references users(id),
  chapter_id text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  outcome text -- 'skip' | 'save' | 'complete'
);

create table saved_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  contact_id uuid references users(id),
  created_at timestamptz default now()
);
```

---

## Environment Variables

See `.env.example` for all required vars. For local development:

```env
# Required (for development)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Optional (for persistence with Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Troubleshooting

**"Socket connection failed"**
- Make sure server is running: `npm run dev:server`
- Check `NEXT_PUBLIC_SOCKET_URL` in `.env.local`

**"Username already taken"**
- This only works if Supabase is configured
- In offline mode, any username is allowed

**"Matching never happens"**
- Check browser console for socket errors
- Ensure both tabs are on `localhost:3000`
- Try opening two tabs with different usernames

---

## Architecture Notes

- **Server**: Lightweight Express + Socket.io, runs on port 3001
- **In-memory queue**: No persistence between restarts (perfect for prototypes)
- **Client state**: Stored in localStorage + React state, synced via Socket.io
- **Database**: Optional Supabase layer for multi-server deployments

---

## License

MIT

---

**Built for the 15-minute gold rush after chapter drops.**
