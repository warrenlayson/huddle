import { collection, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { z } from "zod";

import { auth, firestore } from "../lib/firebase";
import Message from "./Message";
import SendMessage from "./SendMessage";

const messageSchema = z.object({
  username: z.string(),
  message: z.string(),
});

type Message = z.infer<typeof messageSchema>;

const Chat = () => {
  const q = query(collection(firestore, "messages"), orderBy("timestamp"));
  const [value, loading, error] = useCollection(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  if (error) return <strong>Error: {JSON.stringify(error)}</strong>;

  if (!value && loading) return <span>Collection: loading...</span>;

  return (
    <div className="m-4 flex h-full w-full max-w-7xl flex-col shadow-chat-window">
      {/* Tools */}
      <div className="flex shrink flex-grow-0 basis-0 items-center justify-between p-4">
        <button
          type="button"
          className="inline-block rounded bg-blue-600 px-7 py-3 text-sm font-medium uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
          onClick={() => auth.signOut()}
        >
          Logout
        </button>
      </div>
      {/* Messages */}
      <div className="box-border flex w-full shrink grow basis-auto flex-col overflow-y-auto bg-gray-100 p-4">
        {value?.docs.map((doc) => (
          <Message key={doc.id} message={doc.data() as Message} />
        ))}
      </div>
      {/* Send Message */}
      <div className="flex w-full shrink grow-0 basis-10 flex-row items-center justify-between p-4">
        <SendMessage />
      </div>
    </div>
  );
};

export default Chat;
