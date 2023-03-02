import React from "react";
import Image from "next/image";
import { firestore } from "@/lib/firebase";
import { collection, limit, orderBy, query } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

const COMMENT_INCREMENT = 5;

type CommentListProps = { commentCount: number };
const CommentList: React.FC<CommentListProps> = ({ commentCount }) => {
  const [commentLimit, setCommentLimit] = React.useState(5);
  const q = query(
    collection(firestore, "comments"),
    orderBy("createdAt", "desc"),
    limit(commentLimit),
  );
  const [value, loading, error] = useCollection(q);

  if (!value && loading) return <div>Loading...</div>;
  if (error) return <div>Error: {JSON.stringify(error, null, 2)}</div>;
  return (
    <>
      <div className={"mt-6 flex flex-col space-y-4"}>
        {value &&
          value.docs.map((doc) => (
            <div key={doc.id} className={"flex space-x-4"}>
              <Image
                src={"/images/user_icon.svg"}
                alt={"User icon"}
                height={48}
                width={48}
              />
              <span>{doc.get("comment")}</span>
            </div>
          ))}
      </div>
      {value && value.docs.length != commentCount && (
        <button
          type={"button"}
          onClick={() => setCommentLimit(commentLimit + COMMENT_INCREMENT)}
        >
          Show more
        </button>
      )}
    </>
  );
};

export default CommentList;
