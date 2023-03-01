import { useRef, useState, type ReactEventHandler } from "react";
import { type NextPage } from "next";
import Layout from "@/components/Layout";
import { firestore } from "@/lib/firebase";
import { video2tree, type VideoTree } from "@/lib/video2tree";
import { type VideoObject, type VideoSchema } from "@/types.";
import { collection, getDocs, query } from "firebase/firestore";

type VideoPlayerState = "idle" | "playing" | "paused" | "end";

const Home: NextPage<{ video: VideoTree | undefined }> = ({ video: vid }) => {
  const [video, setVideo] = useState(vid);
  const videoPlayer = useRef<HTMLVideoElement | null>(null);
  const [playerState, setPlayerState] = useState<VideoPlayerState>("idle");
  const [end, setEnd] = useState(false);

  const play = async () => {
    setPlayerState("playing");
    await videoPlayer.current?.play();
  };

  const pause = () => {
    videoPlayer.current?.pause();
    setPlayerState("paused");
  };

  const onEnded: ReactEventHandler<HTMLVideoElement> = () => {
    setPlayerState("end");
    if (!video?.children) setEnd(true);
  };

  const chooseOption = async (scene: typeof vid) => {
    setVideo(scene);
    videoPlayer.current?.load();
    await play();
  };

  const reset = () => {
    setEnd(false);
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

  const onTimeUpdate: ReactEventHandler<HTMLVideoElement> = (event) => {
    if (playerState !== "end") {
      const target = event.target as HTMLVideoElement;
      const minutes = Math.floor(target.currentTime / 60);
      const seconds = Math.floor(target.currentTime - minutes * 60);
      const currentTime =
        strPadLeft(minutes, "0", 2) + ":" + strPadLeft(seconds, "0", 2);
      if (currentTime === video?.attributes.time) {
        setPlayerState("end");
      }
    }
  };
  const strPadLeft = (string: number, pad: string, length: number) =>
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    (new Array(length + 1).join(pad) + string).slice(-length);

  console.log(video);
  return (
    <Layout title={"App | Huddle"}>
      <div className="flex h-[calc(100vh-(96px+88px))] w-full justify-center overflow-hidden bg-black ">
        <div className="relative">
          {!end ? (
            <>
              <video
                ref={videoPlayer}
                className=" max-h-full max-w-full object-contain"
                id="media"
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                controls
              >
                <source src={video?.attributes.videoUrl} type="video/mp4" />
              </video>
              {playerState === "end" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-10 bg-video-ended-overlay text-white">
                  <p className="text-center text-xl font-bold uppercase ">
                    What would you do now?
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
                <button
                  type="button"
                  className={cls(
                    "absolute inset-0 z-10 flex h-full w-full cursor-pointer items-center justify-center outline-none",
                  )}
                  onClick={onPlay}
                >
                  <div
                    className={cls(
                      "flex h-28 w-28 items-center justify-center rounded-full bg-[#fca5a5] bg-opacity-40 transition-all",
                      playerState === "playing" ? "opacity-0" : "",
                    )}
                  >
                    {playerState === "paused" || playerState === "idle" ? (
                      <MdPlayArrow className="h-20 w-20 text-white" />
                    ) : (
                      <MdPause className="h-20 w-20 text-white" />
                    )}
                  </div>
                </button>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-10  text-white">
              {video?.attributes.endingText && (
                <h2 className="text-4xl font-bold">
                  {video.attributes.endingText}
                </h2>
              )}
              <button
                className="rounded-md bg-red-800 py-2 px-4 text-2xl font-semibold"
                onClick={reset}
              >
                Play again
              </button>
            </div>
          )}
        </div>
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
