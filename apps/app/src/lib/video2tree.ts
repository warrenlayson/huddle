import { type VideoObject } from "@/types.";

export type VideoTree = {
  name: string;
  id: string;
  attributes: {
    pid?: string | undefined;
    description: string;
    storageUri: string;
    time: string;
    videoUrl: string;
  };
  children?: VideoTree[];
};

export const video2tree = (videos: VideoObject[]): VideoTree | undefined => {
  // first get the root
  const data = videos.map(({ id, fileName, ...rest }) => {
    return {
      name: fileName,
      id,
      attributes: rest,
    };
  });
  const tree = data.filter((video) => video.attributes.pid === null);
  function populateVideosChildren(node: VideoTree) {
    const { id } = node;
    data.forEach((answer) => {
      if (answer.attributes.pid === id) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(answer);
        populateVideoChild(answer);
      }
    });

    return node;
  }

  function populateVideoChild(answer: VideoTree) {
    const { id } = answer;

    data.some((node) => {
      if (node.attributes.pid === id) {
        if (!answer.children) {
          answer.children = [];
        }
        answer.children.push(node);
      }
    });
  }

  return tree.map((node) => populateVideosChildren(node))[0];
};
