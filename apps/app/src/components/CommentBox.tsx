import React from "react";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import { firestore } from "@/lib/firebase";
import { collection, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

function CommentBox() {
  const q = query(collection(firestore, "comments"));
  const [value] = useCollection(q);

  const count = value?.docs.length ?? 0;
  return (
    <div className={"w-full max-w-7xl space-y-4 p-4 text-white"}>
      <h3 className={"text-2xl"}>Comment</h3>
      <div className={"flex flex-col "}>
        {/* Comment Counter */}
        {value && (
          <div className={"my-4 space-x-2"}>
            <span>{count}</span>
            <span>{count > 1 ? "Comments" : "Comment"}</span>
          </div>
        )}
        <hr />
        {/* Comment Box */}
        <CommentForm />
        {/* Comments */}
        <CommentList commentCount={count} />
      </div>
    </div>
  );
}
export default CommentBox;
