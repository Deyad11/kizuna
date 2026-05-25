import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface QueuedUser {
  socketId: string;
  userId: string;         // Supabase user id (or anonymous uuid)
  chapterId: string;
  titleIds: number[];     // interest titles from onboarding
  joinedAt: number;
}

interface ActiveSession {
  sessionId: string;
  userA: string;          // socketId
  userB: string;          // socketId
  chapterId: string;
  startedAt: number;
}

// ─────────────────────────────────────────
// STATE  (in-memory, resets on server restart)
// ─────────────────────────────────────────

// chapterId → list of queued users
const queues = new Map<string, QueuedUser[]>();

// sessionId → session
const sessions = new Map<string, ActiveSession>();

// socketId → sessionId  (quick reverse lookup)
const socketToSession = new Map<string, string>();

// ─────────────────────────────────────────
// JACCARD SIMILARITY
// ─────────────────────────────────────────

function jaccard(a: number[], b: number[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  setB.forEach(id => { if (setA.has(id)) intersection++; });
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

// Find the best match for a user in their chapter queue.
// Returns the matched QueuedUser or null.
function findBestMatch(candidate: QueuedUser): QueuedUser | null {
  const queue = queues.get(candidate.chapterId) ?? [];
  const others = queue.filter(u => u.socketId !== candidate.socketId);

  if (others.length === 0) return null;

  let best: QueuedUser | null = null;
  let bestScore = -1;

  for (const other of others) {
    const score = jaccard(candidate.titleIds, other.titleIds);
    if (score > bestScore) {
      bestScore = score;
      best = other;
    }
  }

  // Minimum threshold: 0.0 (always match if someone is there)
  // Raise to 0.3 once you have enough users
  return best;
}

// ─────────────────────────────────────────
// QUEUE HELPERS
// ─────────────────────────────────────────

function addToQueue(user: QueuedUser) {
  const q = queues.get(user.chapterId) ?? [];
  // Remove any stale entry for same userId
  const fresh = q.filter(u => u.userId !== user.userId);
  fresh.push(user);
  queues.set(user.chapterId, fresh);
}

function removeFromQueue(socketId: string) {
  for (const [chapterId, q] of queues.entries()) {
    const updated = q.filter(u => u.socketId !== socketId);
    queues.set(chapterId, updated);
  }
}

function queueDepth(chapterId: string): number {
  return (queues.get(chapterId) ?? []).length;
}

// ─────────────────────────────────────────
// SERVER SETUP
// ─────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ─────────────────────────────────────────
// REST: queue depth (used by chapter page)
// ─────────────────────────────────────────

app.get('/queue/:chapterId/depth', (req, res) => {
  res.json({ depth: queueDepth(req.params.chapterId) });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, queues: queues.size, sessions: sessions.size });
});

// ─────────────────────────────────────────
// SOCKET EVENTS
// ─────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] connected: ${socket.id}`);

  // ── JOIN QUEUE ──────────────────────────
  // Client emits: { userId, chapterId, titleIds }
  socket.on('queue:join', (payload: {
    userId: string;
    chapterId: string;
    titleIds: number[];
  }) => {
    const { userId, chapterId, titleIds } = payload;

    console.log(`[queue] ${userId} joining queue for ${chapterId}`);

    const user: QueuedUser = {
      socketId: socket.id,
      userId,
      chapterId,
      titleIds: titleIds ?? [],
      joinedAt: Date.now(),
    };

    addToQueue(user);

    // Tell this client they're in queue and current depth
    socket.emit('queue:joined', {
      chapterId,
      depth: queueDepth(chapterId),
    });

    // Broadcast updated depth to everyone watching this chapter
    io.emit(`queue:depth:${chapterId}`, { depth: queueDepth(chapterId) });

    // Try to find a match immediately
    attemptMatch(user);
  });

  // ── LEAVE QUEUE ─────────────────────────
  socket.on('queue:leave', () => {
    removeFromQueue(socket.id);
    console.log(`[queue] ${socket.id} left queue`);
  });

  // ── CHAT MESSAGE ────────────────────────
  // Client emits: { sessionId, text }
  socket.on('chat:message', (payload: { sessionId: string; text: string }) => {
    const { sessionId, text } = payload;
    const session = sessions.get(sessionId);
    if (!session) return;

    const msg = {
      sessionId,
      from: socket.id,
      text: text.slice(0, 500), // cap length
      ts: Date.now(),
    };

    // Send to both participants
    io.to(session.userA).emit('chat:message', msg);
    io.to(session.userB).emit('chat:message', msg);
  });

  // ── SKIP ────────────────────────────────
  socket.on('chat:skip', () => {
    const sessionId = socketToSession.get(socket.id);
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (!session) return;

    const other = session.userA === socket.id ? session.userB : session.userA;

    // Notify both
    socket.emit('chat:ended', { reason: 'skip' });
    io.to(other).emit('chat:ended', { reason: 'partner_skipped' });

    // Clean up
    cleanupSession(sessionId);

    console.log(`[skip] session ${sessionId} ended`);
  });

  // ── DISCONNECT ──────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] disconnected: ${socket.id}`);

    removeFromQueue(socket.id);

    const sessionId = socketToSession.get(socket.id);
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session) {
        const other = session.userA === socket.id ? session.userB : session.userA;
        io.to(other).emit('chat:ended', { reason: 'partner_disconnected' });
        cleanupSession(sessionId);
      }
    }
  });
});

// ─────────────────────────────────────────
// MATCH LOGIC
// ─────────────────────────────────────────

function attemptMatch(candidate: QueuedUser) {
  const match = findBestMatch(candidate);
  if (!match) return;

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const session: ActiveSession = {
    sessionId,
    userA: candidate.socketId,
    userB: match.socketId,
    chapterId: candidate.chapterId,
    startedAt: Date.now(),
  };

  sessions.set(sessionId, session);
  socketToSession.set(candidate.socketId, sessionId);
  socketToSession.set(match.socketId, sessionId);

  // Remove both from queue
  removeFromQueue(candidate.socketId);
  removeFromQueue(match.socketId);

  const similarity = jaccard(candidate.titleIds, match.titleIds);

  const matchPayload = {
    sessionId,
    chapterId: candidate.chapterId,
    similarity: Math.round(similarity * 100),
  };

  console.log(`[match] ${candidate.userId} ↔ ${match.userId} | score: ${Math.round(similarity * 100)}% | chapter: ${candidate.chapterId}`);

  // Emit to both
  io.to(candidate.socketId).emit('match:found', matchPayload);
  io.to(match.socketId).emit('match:found', matchPayload);

  // Update queue depth for the chapter
  io.emit(`queue:depth:${candidate.chapterId}`, {
    depth: queueDepth(candidate.chapterId),
  });
}

function cleanupSession(sessionId: string) {
  const session = sessions.get(sessionId);
  if (!session) return;
  socketToSession.delete(session.userA);
  socketToSession.delete(session.userB);
  sessions.delete(sessionId);
}

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`\n🟢 Kizuna socket server running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});