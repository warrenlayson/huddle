import React, { useState } from "react";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import CommentBox from "@/components/CommentBox";
import GameEndModal from "@/components/GameEndModal";
import Layout from "@/components/Layout";
import VideoButtonOverlay from "@/components/VideoButtonOverlay";
import ViewCounter from "@/components/ViewCounter";
import useViews from "@/hooks/useViews";
import { database, firestore } from "@/lib/firebase";
import { video2tree, type VideoTree } from "@/lib/video2tree";
import { type VideoObject, type VideoSchema } from "@/types.";
import { ref, update } from "firebase/database";
import { collection, getDocs, query } from "firebase/firestore";
import { type OnProgressProps } from "react-player/base";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

type VideoPlayerState = "idle" | "playing" | "paused" | "end";

const Home: NextPage<{ video: VideoTree | undefined }> = ({ video: vid }) => {
  const [video, setVideo] = useState(vid);
  const [playerState, setPlayerState] = useState<VideoPlayerState>("idle");
  const [showOptions, setShowOptions] = useState(false);
  const [end, setEnd] = useState(false);
  const isStart = video === vid;
  const [views, loading, error] = useViews();
  const [firstClick, setFirstClick] = useState(true);

  const play = async () => {
    setPlayerState("playing");
    if (isStart && firstClick) {
      setFirstClick(false);
      const appRef = ref(database, "app");
      await update(appRef, {
        views: (views ?? 0) + 1,
      });
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
    setVideo(vid);
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
    console.log({ duration });
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
                <VideoButtonOverlay
                  ended={end}
                  onClick={onPlay}
                  playing={playerState === "playing"}
                />
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

export async function getServerSideProps() {
  try {
    const q = query(collection(firestore, "videos"));
    const qs = await getDocs(q);
    const videos = qs.docs.map((doc) => {
      const data = doc.data();

      delete data.createdAt;

      return {
        id: doc.id,
        ...(data as VideoSchema),
      };
    }) satisfies VideoObject[];

    const video = video2tree(videos);

    return {
      props: {
        video,
      },
    };
  } catch (error) {
    console.error(error);
  }
}

export default Home;
