import { database } from "@/lib/firebase";
import { ref } from "firebase/database";
import { useObjectVal } from "react-firebase-hooks/database";

export default function useViews() {
  return useObjectVal<number>(ref(database, "app/views"));
}
