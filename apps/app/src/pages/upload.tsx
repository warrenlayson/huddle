import React from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { auth, firestore, storage } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDoc,
  collection,
  query,
  updateDoc,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const videoSchema = z.object({
  description: z.string(),
  fileName: z.string(),
  pid: z.string().uuid().optional(),
  storageUri: z.string(),
  time: z.string(),
  videoUrl: z.string(),
});

type VideoSchema = z.infer<typeof videoSchema>;

const formSchema = z.object({
  fileName: z.string(),
  childOf: z.string().optional(),
  time: z.string(),
  description: z.string(),
  file: z.instanceof(FileList),
  type: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const Upload: NextPage = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const q = query(collection(firestore, "videos"));
  const [value, loading, error] = useCollection(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });

  React.useEffect(() => {
    if (!user) {
      router.replace("/login?return_url=/upload");
    }
  }, [user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fileName: "",
      time: "",
      type: "child",
      description: "",
    },
  });

  const watchType = watch("type");
  const watchFileName = watch("fileName");

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      const videosColRef = collection(firestore, "videos");
      const videoRef = await addDoc(videosColRef, {
        time: data.time,
        pid: data.childOf,
        description: data.description,
        fileName: data.fileName,
      });

      if (data.file[0]) {
        const result = await putVideoStorage(videoRef, data.file[0]);

        await updateDoc(videoRef, {
          videoUrl: result.publicUrl,
          storageUri: result.fileSnapshot.metadata.fullPath,
        });
      }

      reset();
    } catch (err) {
      console.error(err);
    }
  };

  const putVideoStorage = async (
    videoRe: DocumentReference<DocumentData>,
    file: File,
  ) => {
    // Upload the image to Cloud storage
    const fileName = watchFileName ?? file.name;
    const filePath = `${auth.currentUser?.uid}/${videoRe.id}/${fileName}`;
    const newImageRef = ref(storage, filePath);
    const fileSnapshot = await uploadBytesResumable(newImageRef, file);

    // Generate a public url for the file
    const publicUrl = await getDownloadURL(newImageRef);

    return { fileSnapshot, publicUrl } as const;
  };

  if (error) return <strong>Error: {JSON.stringify(error, null, 2)}</strong>;

  if (!value && loading) return <span>Collection: loading...</span>;

  const videos = value!.docs.map((a) => a.data() as VideoSchema);
  const hasRoot = videos.some((video) => !video.pid);

  return (
    <Layout title={"Upload | Huddle"}>
      <Head>
        <meta name={"robots"} content={"noindex"} />
      </Head>
      <div className={"flex flex-row space-x-8 p-6"}>
        {/* form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={"w-2/5 space-y-8  rounded-md border-2 p-6 shadow-md"}
        >
          <h2 className={"text-center text-2xl font-semibold"}>Add Video</h2>
          <div>
            <input
              type="text"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="File Name"
              {...register("fileName")}
              aria-invalid={!!errors.fileName}
            />
            {errors.fileName && <p role="alert">{errors.fileName.message}</p>}
          </div>
          <div>
            <input
              type="file"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="File"
              accept="video/"
              {...register("file")}
            />
          </div>
          <div className="flex space-x-8">
            <label htmlFor="type">Type: </label>
            <div className="flex items-center space-x-4">
              <div className="flex flex-row items-center space-x-4">
                <label htmlFor="child">Child</label>

                <input
                  type="radio"
                  {...register("type")}
                  id="child"
                  value="child"
                  defaultChecked
                />
              </div>
              <div className="flex flex-row items-center space-x-4">
                <label htmlFor="root_vid">Root</label>
                <input
                  type="radio"
                  {...register("type")}
                  id="root_vid"
                  value="root"
                  disabled={hasRoot}
                />
              </div>
            </div>
          </div>
          {watchType === "child" && (
            <div className="space-y-4">
              <label htmlFor="childOf">Child Of: </label>
              <select
                {...register("childOf")}
                id="childOf"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              >
                {value?.docs.map((doc) => {
                  const data = doc.data() as VideoSchema;
                  return (
                    <option key={doc.id} value={doc.id}>
                      {data.fileName}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
          <div>
            <input
              type="text"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="Time"
              {...register("time")}
              aria-invalid={!!errors.time}
            />
            {errors.time && <p role="alert">{errors.time.message}</p>}
          </div>
          <div>
            <input
              type="text"
              className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
              placeholder="Option description"
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && (
              <p role="alert">{errors.description.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="inline-block rounded bg-blue-600 px-7 py-3 text-sm font-medium uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
          >
            Submit
          </button>
        </form>
        {/* videos */}
        <div className={"h-screen w-3/5 rounded-md border-2 shadow-md"}></div>
      </div>
    </Layout>
  );
};

export default Upload;
