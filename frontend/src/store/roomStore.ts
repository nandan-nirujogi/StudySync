import { create } from 'zustand';
import type { LiveMember, StudyRoom } from '@/types';

interface RoomState {
  activeRoom:  StudyRoom | null;
  liveMembers: Record<string, LiveMember>;
  setActiveRoom:  (r: StudyRoom | null) => void;
  setLiveMembers: (ms: LiveMember[]) => void;
  updateMember:   (id: string, u: Partial<LiveMember>) => void;
  addMember:      (m: LiveMember) => void;
  removeMember:   (id: string) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  activeRoom: null, liveMembers: {},
  setActiveRoom:  (r) => set({ activeRoom: r }),
  setLiveMembers: (ms) => set({ liveMembers: Object.fromEntries(ms.map((m) => [m.userId, m])) }),
  updateMember:   (id, u) => set((s) => ({ liveMembers: { ...s.liveMembers, [id]: { ...s.liveMembers[id], ...u } } })),
  addMember:      (m) => set((s) => ({ liveMembers: { ...s.liveMembers, [m.userId]: m } })),
  removeMember:   (id) => set((s) => { const { [id]: _, ...rest } = s.liveMembers; return { liveMembers: rest }; }),
}));