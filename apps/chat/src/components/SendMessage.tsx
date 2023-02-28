import { useRef, useState } from "react";
import cls from "classnames";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { AiFillCloseCircle } from "react-icons/ai";
import { MdClose, MdImage, MdSend } from "react-icons/md";

import { auth, firestore, storage } from "../lib/firebase";

const LOADING_IMAGE_URL = "https://www.google.com/images/spin-32.gif";

const SendMessage = () => {
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<Array<File> | null>(null);

  const sendMessage = async () => {
    try {
      const messageColRef = collection(firestore, "messages");
      const messageRef = await addDoc(messageColRef, {
        username: "pau",
        message: message === "" ? null : message,
        imageUrl:
          images != null
            ? Array.from({ length: images.length }, () => LOADING_IMAGE_URL)
            : null,
        timestamp: serverTimestamp(),
      });

      if (images !== null) {
        const deferredArray = images.map(async (file) =>
          putImageStorage(messageRef, file),
        );
        const result = await Promise.all(deferredArray);

        await updateDoc(messageRef, {
          imageUrl: result.map((res) => res.publicImageUrl),
          storageUri: result.map((res) => res.fileSnapshot.metadata.fullPath),
        });
      }
      setMessage("");
      setImages(null);
    } catch (e) {
      console.error(e);
    }
  };

  const putImageStorage = async (
    messageRef: DocumentReference<DocumentData>,
    file: File,
  ) => {
    // Upload the image to Cloud storage
    const filePath = `${auth.currentUser?.uid}/${messageRef.id}/${file.name}`;
    const newImageRef = ref(storage, filePath);
    const fileSnapshot = await uploadBytesResumable(newImageRef, file);

    // Generate a public url for the file
    const publicImageUrl = await getDownloadURL(newImageRef);

    return { fileSnapshot, publicImageUrl } as const;
  };

  const pickImage = () => {
    fileRef.current?.click();
  };

  return (
    <div
      className={cls(
        images != null ? "items-end" : "items-center",
        "flex w-full  justify-between",
      )}
    >
      <input
        ref={fileRef}
        onChange={(e) =>
          setImages(e.target.files ? Array.from(e.target.files) : null)
        }
        type="file"
        name="images"
        accept="image/*"
        multiple
        className="hidden"
      />
      <MdImage className="mr-4 cursor-pointer text-2xl" onClick={pickImage} />
      <div
        className={cls(images !== null ? "space-y-4" : "", "w-full flex-grow")}
      >
        <div className={cls("flex  flex-row space-x-4")}>
          {images?.map((image, idx) => {
            const readImage = URL.createObjectURL(image);
            return (
              <div className="relative" key={`${image.name}-${idx}`}>
                <AiFillCloseCircle
                  className="absolute top-0 right-0 cursor-pointer"
                  onClick={() =>
                    setImages(images.filter((file) => file !== image))
                  }
                />
                <img src={readImage} className="h-12 w-12" />
              </div>
            );
          })}
        </div>
        <input
          type="text"
          className=" w-full rounded border  border-solid border-gray-300 py-2 px-4 focus:text-gray-700"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "enter") {
              sendMessage();
            }
          }}
        />
      </div>
      <MdSend className="ml-4 cursor-pointer text-2xl" onClick={sendMessage} />
    </div>
  );
};

export default SendMessage;
