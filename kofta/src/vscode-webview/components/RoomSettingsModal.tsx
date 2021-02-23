import { useAtom } from "jotai";
import React from "react";
import { X } from "react-feather";
import { wsend } from "@dogehouse/feta";
import { renameRoomAndMakePublic } from "../../webrtc/utils/renameRoomAndMakePublic";
import { currentRoomAtom } from "../atoms";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { modalPrompt } from "./PromptModal";

interface RoomSettingsModalProps {
  open: boolean;
  onRequestClose: () => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  open,
  onRequestClose,
}) => {
  const [currentRoom, setCurrentRoom] = useAtom(currentRoomAtom);
  return (
    <Modal isOpen={open} onRequestClose={onRequestClose}>
      <button
        onClick={() => {
          onRequestClose();
        }}
        className={`p-2 -ml-3`}
      >
        <X />
      </button>
      {currentRoom ? (
        <>
          <label className={`flex items-center my-8`} htmlFor="auto-speaker">
            <input
              checked={!currentRoom.autoSpeaker}
              onChange={(e) => {
                setCurrentRoom((cr) =>
                  !cr
                    ? cr
                    : {
                        ...cr,
                        autoSpeaker: !e.target.checked,
                      }
                );
                wsend({
                  op: "set_auto_speaker",
                  d: { value: !e.target.checked },
                });
              }}
              id="auto-speaker"
              type="checkbox"
            />
            <span className={`ml-2`}>require permission to speak</span>
          </label>
          {currentRoom.isPrivate ? (
            <Button
              onClick={() => {
                renameRoomAndMakePublic(currentRoom.name);
                onRequestClose();
              }}
            >
              make room public
            </Button>
          ) : (
            <Button
              onClick={() => {
                modalPrompt(
                  "Set private room name",
                  (roomName) => {
                    if (roomName) {
                      wsend({
                        op: "make_room_private",
                        d: { newName: roomName },
                      });
                    }
                  },
                  currentRoom.name
                );
                onRequestClose();
              }}
            >
              make room private
            </Button>
          )}
        </>
      ) : null}
    </Modal>
  );
};
