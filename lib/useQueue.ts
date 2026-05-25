import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type QueueStatus =
  | 'idle'
  | 'joining'
  | 'queued'
  | 'matched'
  | 'ended';

export interface MatchPayload {
  sessionId: string;
  chapterId: string;
  similarity: number;   // 0-100
}

export interface ChatMessage {
  sessionId: string;
  from: string;         // socketId — compare to socket.id to know if "mine"
  text: string;
  ts: number;
}

interface UseQueueOptions {
  userId: string;
  chapterId: string;
  titleIds: number[];
  enabled: boolean;     // only connect when user clicks "I just read it"
}

export function useQueue({ userId, chapterId, titleIds, enabled }: UseQueueOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<QueueStatus>('idle');
  const [match, setMatch] = useState<MatchPayload | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queueDepth, setQueueDepth] = useState(0);
  const [endReason, setEndReason] = useState<string | null>(null);

  // ── CONNECT ──────────────────────────────
  useEffect(() => {
    if (!enabled || !userId || !chapterId) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    setStatus('joining');

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
      socket.emit('queue:join', { userId, chapterId, titleIds });
    });

    socket.on('queue:joined', ({ depth }: { depth: number }) => {
      setStatus('queued');
      setQueueDepth(depth);
    });

    // Live depth updates for this chapter
    socket.on(`queue:depth:${chapterId}`, ({ depth }: { depth: number }) => {
      setQueueDepth(depth);
    });

    socket.on('match:found', (payload: MatchPayload) => {
      console.log('[socket] matched!', payload);
      setMatch(payload);
      setStatus('matched');
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('chat:ended', ({ reason }: { reason: string }) => {
      setEndReason(reason);
      setStatus('ended');
    });

    socket.on('disconnect', () => {
      console.log('[socket] disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, userId, chapterId]);  // titleIds intentionally excluded — stable after mount

  // ── ACTIONS ──────────────────────────────

  const sendMessage = useCallback((text: string) => {
    if (!socketRef.current || !match) return;
    socketRef.current.emit('chat:message', {
      sessionId: match.sessionId,
      text,
    });
  }, [match]);

  const skip = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('chat:skip');
  }, []);

  const leaveQueue = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('queue:leave');
    setStatus('idle');
    setQueueDepth(0);
  }, []);

  const mySocketId = socketRef.current?.id ?? null;

  return {
    status,
    match,
    messages,
    queueDepth,
    endReason,
    mySocketId,
    sendMessage,
    skip,
    leaveQueue,
  };
}