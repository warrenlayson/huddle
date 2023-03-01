import { useEffect, useRef, useState, type ReactEventHandler } from "react";
import { type NextPage } from "next";
import Layout from "@/components/Layout";
import useVideos from "@/hooks/useVideos";
import { firestore } from "@/lib/firebase";
import { videoSchema, type VideoSchema } from "@/types.";
import cls from "classnames";
import { collection, getDoc, getDocs, query } from "firebase/firestore";
import { MdPause, MdPlayArrow } from "react-icons/md";

type VideoPlayerState = "idle" | "playing" | "paused" | "end";

type VideoObject = VideoSchema & {
  id: string;
  children?: VideoObject[];
};

const Home: NextPage<{ video: VideoObject }> = ({ video: vid }) => {
  const [video, setVideo] = useState<VideoObject>(vid);
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
    if (!video.children) setEnd(true);
  };

  const chooseOption = async (scene: VideoObject) => {
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
      if (currentTime === video.time) {
        setPlayerState("end");
      }
    }
  };
  const strPadLeft = (string: number, pad: string, length: number) =>
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    (new Array(length + 1).join(pad) + string).slice(-length);

  return (
    <Layout title={"App | Huddle"}>
      <div className="flex h-[calc(100vh-(96px+88px))] w-full justify-center overflow-hidden bg-black ">
        <div className="relative">
          {!end ? (
            <></>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-10  text-white">
              <h2 className="text-4xl font-bold">Thank you</h2>
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
    const videos = qs.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as VideoSchema),
    })) satisfies VideoObject[];

    // first get the root
    const tree = videos.filter((video) => video.pid === null);
    console.log(videos);
    function populateVideosChildren(node: VideoObject) {
      const { id } = node;
      videos.forEach((answer) => {
        if (answer.pid === id) {
          if (!node.children) {
            node.children = [];
          }
          node.children.push(answer);
          populateVideoChild(answer);
        }
      });

      return node;
    }

    function populateVideoChild(answer: VideoObject) {
      const { id } = answer;

      videos.some((node) => {
        if (node.pid === id) {
          if (!answer.children) {
            answer.children = [];
          }
          answer.children.push(node);
        }
      });
    }

    const video = tree.map((node) => populateVideosChildren(node))[0];

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
