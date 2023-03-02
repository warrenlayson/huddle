import React, { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { UploadForm } from "@/components/UploadForm";
import useVideos from "@/hooks/useVideos";
import { auth } from "@/lib/firebase";
import { video2tree } from "@/lib/video2tree";
import { type VideoObject, type VideoSchema } from "@/types.";
import Tree from "react-d3-tree";
import { type RenderCustomNodeElementFn } from "react-d3-tree/lib/types/types/common";
import { useAuthState } from "react-firebase-hooks/auth";

const Upload: NextPage = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [value, loading, error] = useVideos();
  const [tree, setTree] = useState<ReturnType<typeof video2tree>>(undefined);

  React.useEffect(() => {
    if (!user) {
      void router.replace("/login?return_url=/upload");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  React.useEffect(() => {
    if (value && !loading) {
      const videos = value.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as VideoSchema),
      })) satisfies VideoObject[];
      setTree(video2tree(videos));
    }
  }, [value, loading]);

  if (error) return <strong>Error: {JSON.stringify(error, null, 2)}</strong>;

  if (!value && loading) return <span>Collection: loading...</span>;
  return (
    <Layout title={"Upload | Huddle"}>
      <Head>
        <meta name={"robots"} content={"noindex"} />
      </Head>
      <div className={"flex flex-row space-x-8 bg-white p-6"}>
        {/* form */}
        <UploadForm />
        {/* videos */}
        <div
          className={
            "overflow- h-screen w-3/5 gap-4 rounded-md border-2 p-6 shadow-md"
          }
        >
          {tree && (
            <div id="treeWrapper" className="h-full w-full">
              <Tree
                data={tree}
                nodeSize={{ x: 500, y: 200 }}
                renderCustomNodeElement={renderRectSvgNode}
                orientation="vertical"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Here we're using `renderCustomNodeElement` to represent each node
// as an SVG `rect` instead of the default `circle`.
const renderRectSvgNode: RenderCustomNodeElementFn = ({
  nodeDatum,
  toggleNode,
}) => (
  <g>
    <rect width="20" height="20" x="-10" onClick={toggleNode} />
    <text fill="black" strokeWidth="1" x="20">
      {nodeDatum.name}
    </text>
    {nodeDatum.attributes?.time && (
      <text fill="black" x="20" dy="20" strokeWidth="1">
        Time: {nodeDatum.attributes?.time}
      </text>
    )}
    {nodeDatum.attributes?.description && (
      <text fill="black" x="20" dy="40" strokeWidth="1">
        Option Name: {nodeDatum.attributes?.description}
      </text>
    )}
    {nodeDatum.attributes?.question && (
      <text fill="black" x="20" dy="60" strokeWidth="1">
        Q: {nodeDatum.attributes?.question}
      </text>
    )}
  </g>
);

export default Upload;
