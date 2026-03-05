import { useEffect, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/roomStore";
import type { LiveMember } from "@/types";

export function useSocket() {
  const init = useRef(false);
  const { addMember, removeMember, updateMember, setLiveMembers } =
    useRoomStore();

  useEffect(() => {
    if (init.current) return;
    init.current = true;
    const socket = connectSocket();

    socket.on("room:state", ({ members }: { members: LiveMember[] }) =>
      setLiveMembers(members),
    );
    socket.on("member:joined", (m: LiveMember) =>
      addMember({ ...m, status: "idle" }),
    );
    socket.on("member:left", ({ userId }: any) => removeMember(userId));
    socket.on("member:timer:start", ({ userId, subject, startedAt }: any) =>
      updateMember(userId, {
        status: "studying",
        subject,
        timerStartedAt: startedAt,
      }),
    );
    socket.on("member:timer:pause", ({ userId }: any) =>
      updateMember(userId, { status: "idle" }),
    );
    socket.on("member:timer:stop", ({ userId }: any) =>
      updateMember(userId, {
        status: "idle",
        subject: undefined,
        timerStartedAt: undefined,
      }),
    );
    socket.on("member:away", ({ userId }: any) =>
      updateMember(userId, { status: "away" }),
    );
    socket.on("member:returned", ({ userId, status }: any) =>
      updateMember(userId, { status }),
    );

    return () => {
      disconnectSocket();
      init.current = false;
    };
  }, []);

  return getSocket();
}
