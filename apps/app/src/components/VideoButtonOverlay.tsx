import React from "react";
import cls from "classnames";
import { MdPause, MdPlayArrow } from "react-icons/md";

type VideoButtonOverlayProps = {
  ended: boolean;
  onClick: () => void;
  playing: boolean;
};
const VideoButtonOverlay: React.FC<VideoButtonOverlayProps> = ({
  ended,
  onClick,
  playing,
}) => {
  return (
    <button
      type="button"
      className={cls(
        "absolute inset-0 z-10 flex h-full w-full cursor-pointer items-center justify-center outline-none",
        ended ? "opacity-0" : "",
      )}
      onClick={onClick}
    >
      <div
        className={cls(
          "flex h-28 w-28 items-center justify-center rounded-full bg-[#fca5a5] bg-opacity-40 transition-all",
          playing ? "opacity-0" : "",
        )}
      >
        {!playing ? (
          <MdPlayArrow className="h-20 w-20 text-white" />
        ) : (
          <MdPause className="h-20 w-20 text-white" />
        )}
      </div>
    </button>
  );
};

export default VideoButtonOverlay;
