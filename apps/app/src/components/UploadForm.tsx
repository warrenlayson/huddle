import React from "react";
import useVideos from "@/hooks/useVideos";
import { auth, firestore, storage } from "@/lib/firebase";
import { type VideoSchema } from "@/types.";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type DocumentReference,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

export const UploadForm = () => {
  const [value, loading, error] = useVideos();

  const formSchema = z.object({
    fileName: z.string(),
    time: z.string().optional(),
    description: z.string().optional(),
    file: z.instanceof(FileList),
    pid: z.string().optional(),
  });

  type FormSchema = z.infer<typeof formSchema>;

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
    },
  });

  const watchFileName = watch("fileName");

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      const videosColRef = collection(firestore, "videos");
      const fileName = data.fileName.split(" ").join("_");
      const videoRef = await addDoc(videosColRef, {
        time: data.time ?? null,
        pid: data.pid ?? null,
        description: data.description ?? null,
        fileName: fileName ?? data.file[0]?.name,
        createdAt: serverTimestamp(),
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
    const fileName = watchFileName.split(" ").join("_") ?? file.name;
    const filePath = `${auth.currentUser?.uid}/${videoRe.id}/${fileName}`;
    const newImageRef = ref(storage, filePath);
    const fileSnapshot = await uploadBytesResumable(newImageRef, file);

    // Generate a public url for the file
    const publicUrl = await getDownloadURL(newImageRef);

    return { fileSnapshot, publicUrl } as const;
  };
  return (
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
      {value?.docs.length !== 0 && (
        <div className="space-y-4">
          <label htmlFor="childOf">Parent: </label>
          <select
            {...register("pid")}
            id="childOf"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            defaultValue={"null"}
          >
            <option value={"null"} disabled>
              Select Here
            </option>
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
        {errors.description && <p role="alert">{errors.description.message}</p>}
      </div>
      <button
        type="submit"
        className="inline-block rounded bg-blue-600 px-7 py-3 text-sm font-medium uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
      >
        Submit
      </button>
    </form>
  );
};
