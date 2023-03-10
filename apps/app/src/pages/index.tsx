import React, { useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import CommentBox from "@/components/CommentBox";
import GameEndModal from "@/components/GameEndModal";
import Layout from "@/components/Layout";
import VideoButtonOverlay from "@/components/VideoButtonOverlay";
import ViewCounter from "@/components/ViewCounter";
import useVideos from "@/hooks/useVideos";
import useViews from "@/hooks/useViews";
import { database } from "@/lib/firebase";
import { type VideoTree } from "@/lib/video2tree";
import { ref, update } from "firebase/database";
import { type OnProgressProps } from "react-player/base";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

type VideoPlayerState = "idle" | "playing" | "paused" | "end";

const Home: NextPage<{ video: VideoTree | undefined }> = ({ video: vid }) => {
  const [video, setVideo] = useState(vid);
  const [playerState, setPlayerState] = useState<VideoPlayerState>("idle");
  const [showOptions, setShowOptions] = useState(false);
  const [end, setEnd] = useState(false);
  const [views, loading, error] = useViews();
  const [firstClick, setFirstClick] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data, error: videosError } = useVideos();

  React.useEffect(() => {
    if (data && !videosError) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setVideo(JSON.parse(data));
    }
  }, [data, videosError]);

  const play = async () => {
    setPlayerState("playing");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isStart = Boolean(data && video?.id === JSON.parse(data)?.id);
    if (isStart && firstClick) {
      setFirstClick(false);
      const appRef = ref(database, "app");
      views &&
        (await update(appRef, {
          views: views + 1,
        }));
    }
  };

  const pause = () => {
    setPlayerState("paused");
  };

  const onEnded = () => {
    setPlayerState("end");
    if (!video?.children) setEnd(true);
  };

  const chooseOption = async (scene: typeof vid) => {
    setVideo(scene);
    setShowOptions(false);
    await play();
  };

  const reset = () => {
    setEnd(false);
    setFirstClick(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    data && setVideo(JSON.parse(data));
    setPlayerState("idle");
  };

  const onPlay = () => {
    if (playerState === "idle" || playerState === "paused") {
      void play();
    } else {
      void pause();
    }
  };

  const onTimeUpdate = (duration: number) => {
    if (playerState !== "end") {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration - minutes * 60);
      const currentTime =
        strPadLeft(minutes, "0", 2) + ":" + strPadLeft(seconds, "0", 2);
      if (currentTime === video?.attributes.time) {
        setPlayerState("end");
      }
    }
  };

  const onProgress = (props: OnProgressProps) => {
    if (playerState !== "end") {
      const minutes = Math.floor(props.playedSeconds / 60);
      const seconds = Math.floor(props.playedSeconds - minutes * 60);
      const currentTime =
        strPadLeft(minutes, "0", 2) + ":" + strPadLeft(seconds, "0", 2);
      if (currentTime === video?.attributes.time) {
        if (!video?.children) {
          setEnd(true);
        } else {
          setShowOptions(true);
        }
      }
    }
  };

  const strPadLeft = (string: number, pad: string, length: number) =>
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    (new Array(length + 1).join(pad) + string).slice(-length);

  return (
    <Layout title={"App | Huddle"}>
      <div className="flex h-full w-full flex-col  items-center bg-black ">
        <div className={"flex w-full justify-center"}>
          <ViewCounter />
        </div>
        {error ? (
          <h2>
            Error... Please refresh the page, if problem persists report to
            Huddle
          </h2>
        ) : loading ? (
          <>Loading...</>
        ) : (
          <>
            <div className="relative h-[calc(100vh-88px)]  w-full ">
              <ReactPlayer
                url={video?.attributes.videoUrl}
                playing={playerState === "playing"}
                width="100%"
                height={"100%"}
                onEnded={onEnded}
                onDuration={onTimeUpdate}
                onProgress={onProgress}
              />
              {playerState === "end" || showOptions ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-10 bg-video-ended-overlay text-white">
                  <p className="text-center text-xl font-bold uppercase ">
                    {video?.attributes.question}
                  </p>
                  <div className="flex flex-col items-center gap-10">
                    {video?.children?.map((child) => (
                      <button
                        key={child.id}
                        className="text w-72 min-w-[64px] rounded-md bg-option px-4 py-2 font-semibold outline-none"
                        onClick={() => void chooseOption(child)}
                      >
                        {child?.attributes.description}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <VideoButtonOverlay
                    ended={end}
                    onClick={onPlay}
                    playing={playerState === "playing"}
                  />
                </>
              )}
              {end && video && video.attributes.endingText && (
                <GameEndModal
                  text={video.attributes.endingText}
                  onClick={reset}
                />
              )}
            </div>
            <CommentBox />
          </>
        )}
      </div>
    </Layout>
  );
};

export default Home;
