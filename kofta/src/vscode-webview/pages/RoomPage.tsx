import { useAtom } from "jotai";
import React, { useState } from "react";
import { Redirect, useRouteMatch } from "react-router-dom";
import { tw } from "twind";
import { wsend } from "@dogehouse/feta/createWebsocket";
import { useMuteStore } from "@dogehouse/feta/webrtc/stores/useMuteStore";
import { currentRoomAtom, meAtom, myCurrentRoomInfoAtom } from "../atoms";
import { Backbar } from "../components/Backbar";
import { BodyWrapper } from "../components/BodyWrapper";
import { BottomVoiceControl } from "../components/BottomVoiceControl";
import { CircleButton } from "../components/CircleButton";
import { modalConfirm } from "../components/ConfirmModal";
import { ProfileButton } from "../components/ProfileButton";
import { ProfileModal } from "../components/ProfileModal";
import { modalPrompt } from "../components/PromptModal";
import { RoomUserNode } from "../components/RoomUserNode";
import { Wrapper } from "../components/Wrapper";
import { Codicon } from "../svgs/Codicon";
import { BaseUser } from "@dogehouse/feta/types";
import { isUuid } from "@dogehouse/feta/utils/isUuid";

interface RoomPageProps {}

export const RoomPage: React.FC<RoomPageProps> = () => {
  const {
    params: { id },
  } = useRouteMatch<{ id: string }>();
  const [userProfileId, setUserProfileId] = useState("");
  const [room] = useAtom(currentRoomAtom);
  const { muted } = useMuteStore();
  const [me] = useAtom(meAtom);
  const [
    { isMod: iAmMod, isCreator: iAmCreator, canSpeak: iCanSpeak },
  ] = useAtom(myCurrentRoomInfoAtom);

  // useEffect(() => {
  //   if (room?.users.length) {
  //     setUserProfileId(room.users[0].id);
  //     wsend({ op: "follow_info", d: { userId: room.users[0].id } });
  //   }
  // }, []);

  if (!isUuid(id)) {
    return <Redirect to="/" />;
  }

  if (!room) {
    return (
      <Wrapper>
        <Backbar />
        <BodyWrapper>
          <div>loading...</div>
        </BodyWrapper>
      </Wrapper>
    );
  }

  const profile = room.users.find((x: any) => x.id === userProfileId);

  const speakers: BaseUser[] = [];
  const unansweredHands: BaseUser[] = [];
  const listeners: BaseUser[] = [];
  let canIAskToSpeak = false;

  room.users.forEach((u: any) => {
    if (u.id === room.creatorId || u.roomPermissions?.isSpeaker) {
      speakers.push(u);
    } else if (u.roomPermissions?.askedToSpeak) {
      unansweredHands.push(u);
    } else {
      canIAskToSpeak = true;
      listeners.push(u);
    }
  });

  return (
    <>
      <ProfileModal
        iAmCreator={iAmCreator}
        iAmMod={iAmMod}
        isMe={profile?.id === me?.id}
        room={room}
        onClose={() => setUserProfileId("")}
        profile={profile}
      />
      <Backbar>
        <button
          disabled={!iAmCreator}
          onClick={() => {
            modalPrompt("Edit Room Name", (name) => {
              if (name) {
                wsend({ op: "edit_room_name", d: { name } });
              }
            });
          }}
          className={`block font-xl overflow-hidden overflow-ellipsis flex-1 text-center flex items-center justify-center text-2xl`}
        >
          {room.name.slice(0, 50)}
        </button>
        <ProfileButton />
      </Backbar>
      <Wrapper>
        <BodyWrapper>
          <div
            style={{
              gridTemplateColumns: "repeat(auto-fit, 90px)",
            }}
            className={`w-full grid gap-5`}
          >
            <div className={`col-span-full text-xl ml-2.5 text-white`}>
              Speakers ({speakers.length})
            </div>
            {speakers.map((u) => (
              <RoomUserNode
                key={u.id}
                room={room}
                u={u}
                muted={muted}
                setUserProfileId={setUserProfileId}
                me={me}
                profile={profile}
              />
            ))}
            {!iCanSpeak && me && canIAskToSpeak ? (
              <div className={`flex flex-col items-center`}>
                <CircleButton
                  title="Request to speak"
                  size={70}
                  onClick={() => {
                    modalConfirm("Would you like to ask to speak?", () => {
                      wsend({ op: "ask_to_speak", d: {} });
                    });
                  }}
                >
                  <Codicon width={36} height={36} name="megaphone" />
                </CircleButton>
              </div>
            ) : null}
            {unansweredHands.length ? (
              <div className={`col-span-full text-xl ml-2.5 text-white`}>
                Requesting to speak ({unansweredHands.length})
              </div>
            ) : null}
            {unansweredHands.map((u) => (
              <RoomUserNode
                key={u.id}
                room={room}
                u={u}
                muted={muted}
                setUserProfileId={setUserProfileId}
                me={me}
                profile={profile}
              />
            ))}
            {listeners.length ? (
              <div className={`col-span-full text-xl mt-2.5 ml-2.5 text-white`}>
                Listeners ({listeners.length})
              </div>
            ) : null}
            {listeners.map((u) => (
              <RoomUserNode
                key={u.id}
                room={room}
                u={u}
                muted={muted}
                setUserProfileId={setUserProfileId}
                me={me}
                profile={profile}
              />
            ))}
          </div>
        </BodyWrapper>
      </Wrapper>
      <BottomVoiceControl />
    </>
  );
};
