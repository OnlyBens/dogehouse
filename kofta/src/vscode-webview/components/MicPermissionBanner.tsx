import React, { useState } from "react";
import { useMicPermErrorStore } from "@dogehouse/feta/webrtc/stores/useMicPermErrorStore";
import { sendVoice } from "@dogehouse/feta/webrtc/utils/sendVoice";
import { isIOS } from "@dogehouse/feta/utils/isIOS";
import { Button } from "./Button";

interface MicPermissionBannerProps {}

export const MicPermissionBanner: React.FC<MicPermissionBannerProps> = () => {
  const { error } = useMicPermErrorStore();
  const [count, setCount] = useState(0);
  if (!error) {
    return null;
  }
  return (
    <div className={`p-4 bg-simple-gray-3c`}>
      <div className={`font-semibold text-xl mb-4 bg-red-400`}>
        Permission denied trying to access your mic
      </div>
      <Button
        onClick={() => {
          if (count < 2 && !isIOS()) {
            sendVoice();
            setCount((c) => c + 1);
          } else {
            window.location.reload();
          }
        }}
      >
        try again
      </Button>
    </div>
  );
};
