import { create } from 'zustand';

type Status = 'idle' | 'running' | 'paused';

interface TimerState {
  status:           Status;
  session:          any | null;
  elapsedSeconds:   number;
  subject:          string;
  distractionCount: number;
  startTimer:     (session: any) => void;
  pauseTimer:     () => void;
  resumeTimer:    () => void;
  stopTimer:      () => void;
  tick:           () => void;
  incDistraction: () => void;
  setSubject:     (s: string) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  status: 'idle', session: null, elapsedSeconds: 0, subject: '', distractionCount: 0,
  startTimer:     (session) => set({ status: 'running', session, elapsedSeconds: 0, distractionCount: 0, subject: session.subject }),
  pauseTimer:     () => set({ status: 'paused' }),
  resumeTimer:    () => set({ status: 'running' }),
  stopTimer:      () => set({ status: 'idle', session: null, elapsedSeconds: 0, distractionCount: 0 }),
  tick:           () => { if (get().status === 'running') set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })); },
  incDistraction: () => set((s) => ({ distractionCount: s.distractionCount + 1 })),
  setSubject:     (subject) => set({ subject }),
}));

export function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}