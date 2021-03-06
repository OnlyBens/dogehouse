import React, { useMemo } from "react";
import { GlobalHotKeys } from "react-hotkeys";
import { wsend } from "@dogehouse/feta";
import { useKeyMapStore } from "@dogehouse/feta";
import { useMuteStore } from "@dogehouse/feta";

interface KeybindListenerProps {}

export const KeybindListener: React.FC<KeybindListenerProps> = ({}) => {
  const { keyMap } = useKeyMapStore();

  return (
    <GlobalHotKeys
      allowChanges={true}
      keyMap={keyMap}
      handlers={useMemo(
        () => ({
          MUTE: () => {
            const { muted, set } = useMuteStore.getState();
            wsend({
              op: "mute",
              d: { value: !muted },
            });
            set({ muted: !muted });
          },
          PTT: (e) => {
            if (!e) return;

            const { set } = useMuteStore.getState();
            const mute = e.type === "keyup";
            wsend({
              op: "mute",
              d: { value: mute },
            });
            set({ muted: mute });
          },
        }),
        []
      )}
    />
  );
};
