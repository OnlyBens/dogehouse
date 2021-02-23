import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../vscode-webview/components/Button";
import { volumeAtom } from "../../vscode-webview/shared-atoms";
import { useConsumerStore } from "@dogehouse/feta/webrtc/stores/useConsumerStore";

interface AudioRenderProps {}

const MyAudio = ({
  volume,
  onRef,
  ...props
}: React.DetailedHTMLProps<
  React.AudioHTMLAttributes<HTMLAudioElement>,
  HTMLAudioElement
> & {
  onRef: (a: HTMLAudioElement) => void;
  volume: number;
}) => {
  const myRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    if (myRef.current) {
      myRef.current.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      ref={(r) => {
        // @todo
        if (r && !myRef.current) {
          (myRef as any).current = r;
          onRef(r);
        }
      }}
      {...props}
    />
  );
};

export const AudioRender: React.FC<AudioRenderProps> = () => {
  const hasShownAutoPlayModalBefore = useRef(false);
  const [showAutoPlayModal, setShowAutoPlayModal] = useState(false);
  const [globalVolume] = useAtom(volumeAtom);
  const { consumerMap } = useConsumerStore();
  const audioRefs = useRef<HTMLAudioElement[]>([]);

  return (
    <>
      <div
        className={`absolute w-full h-full flex z-50 bg-simple-gray-80 ${
          showAutoPlayModal ? "" : "hidden"
        }`}
      >
        <div className={`p-8 rounded m-auto bg-simple-gray-3c`}>
          <div className={`text-center mb-4`}>
            Browsers require user interaction before they will play audio. Just
            click okay to continue.
          </div>
          <Button
            onClick={() => {
              setShowAutoPlayModal(false);
              audioRefs.current.forEach((a) => {
                a.play().catch((err) => {
                  console.warn(err);
                });
              });
            }}
          >
            okay
            {Object.keys(consumerMap).map((k) => {
              const { consumer, volume: userVolume } = consumerMap[k];
              return (
                <MyAudio
                  volume={(userVolume / 200) * (globalVolume / 100)}
                  autoPlay
                  playsInline
                  controls={false}
                  key={consumer.id}
                  onRef={(a) => {
                    audioRefs.current.push(a);
                    a.srcObject = new MediaStream([consumer.track]);
                    a.play().catch((error) => {
                      if (
                        error.name === "NotAllowedError" &&
                        !hasShownAutoPlayModalBefore.current
                      ) {
                        hasShownAutoPlayModalBefore.current = true;
                        setShowAutoPlayModal(true);
                      }
                      console.warn("audioElem.play() failed:%o", error);
                    });
                  }}
                />
              );
            })}
          </Button>
        </div>
      </div>
    </>
  );
};
