import { useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '@/store/timerStore';
import { sessionsApi }   from '@/lib/api';
import { timerSocket, tabSocket } from '@/lib/socket';

const TAB_PAUSE_MS = 30_000;

export function useTimer(roomId?: string) {
  const store   = useTimerStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (store.status === 'running') {
      tickRef.current = setInterval(() => store.tick(), 1000);
    } else {
      if (tickRef.current) clearInterval(tickRef.current);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [store.status]);

  useEffect(() => {
    let autoTimer: ReturnType<typeof setTimeout> | null = null;

    const handler = () => {
      if (document.hidden) {
        tabSocket.hidden(roomId);
        if (store.status !== 'running') return;
        autoTimer = setTimeout(() => {
          if (document.hidden) { pauseSession(); store.incDistraction(); }
        }, TAB_PAUSE_MS);
      } else {
        if (autoTimer) clearTimeout(autoTimer);
        tabSocket.visible(roomId);
      }
    };

    document.addEventListener('visibilitychange', handler);
    return () => {
      document.removeEventListener('visibilitychange', handler);
      if (autoTimer) clearTimeout(autoTimer);
    };
  }, [store.status, roomId]);

  const startSession = useCallback(async (subject: string) => {
    const { data: session } = await sessionsApi.start({ subject, roomId });
    store.startTimer(session);
    timerSocket.start({ subject, sessionId: session.id, roomId });
    return session;
  }, [roomId]);

  const pauseSession = useCallback(async () => {
    if (!store.session) return;
    await sessionsApi.pause(store.session.id);
    store.pauseTimer();
    timerSocket.pause(roomId);
  }, [store.session, roomId]);

  const resumeSession = useCallback(async () => {
    if (!store.session) return;
    await sessionsApi.resume(store.session.id);
    store.resumeTimer();
  }, [store.session]);

  const stopSession = useCallback(async (meta: { memo?: string; rating?: number }) => {
    if (!store.session) return null;
    const { data } = await sessionsApi.stop(store.session.id, { subject: store.subject, ...meta });
    timerSocket.stop({ durationSeconds: data.durationSeconds, roomId });
    store.stopTimer();
    return data;
  }, [store.session, store.subject, roomId]);

  return {
    status:           store.status,
    session:          store.session,
    elapsedSeconds:   store.elapsedSeconds,
    subject:          store.subject,
    distractionCount: store.distractionCount,
    startSession, pauseSession, resumeSession, stopSession,
    setSubject: store.setSubject,
  };
}