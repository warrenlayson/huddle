import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useVideos() {
  return useSWR<string>("/api/videos", fetcher);
}
