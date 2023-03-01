import { firestore } from "@/lib/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

export default function useVideos() {
  const q = query(collection(firestore, "videos"), orderBy("createdAt"));
  return useCollection(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
}
