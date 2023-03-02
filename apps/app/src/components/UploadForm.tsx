import useVideos from "@/hooks/useVideos";
import { firestore } from "@/lib/firebase";
import { type VideoSchema } from "@/types.";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

export const UploadForm = () => {
  const [value] = useVideos();

  const formSchema = z.object({
    nickname: z.string().optional(),
    time: z.string().optional(),
    description: z.string().optional(),
    file: z.string(),
    pid: z.string().optional(),
    endingText: z.string().optional(),
    question: z.string().optional(),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      const videosColRef = collection(firestore, "videos");
      const fileName = data.nickname?.split(" ").join("_");
      await addDoc(videosColRef, {
        time: data.time ?? null,
        pid: data.pid ?? null,
        description: data.description ?? null,
        fileName: fileName,
        createdAt: serverTimestamp(),
        endingText: data.endingText,
        videoUrl: `https://stream.mux.com/${data.file}/low.mp4`,
        question: data.question,
      });

      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
      className={"w-2/5 space-y-8  rounded-md border-2 p-6 shadow-md"}
    >
      <h2 className={"text-center text-2xl font-semibold"}>Add Video</h2>
      <div>
        <input
          type="text"
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          placeholder="Nickname"
          {...register("nickname")}
          aria-invalid={!!errors.nickname}
        />
        {errors.nickname && <p role="alert">{errors.nickname.message}</p>}
      </div>
      <div>
        <input
          type="text"
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          placeholder="Playbackid"
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
              const parent = value.docs
                .find((doc) => doc.id === data.pid)
                ?.data();
              return (
                <option key={doc.id} value={doc.id}>
                  {data.fileName} {parent && `- ${parent.fileName}`}
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
          placeholder="Time (optional)"
          {...register("time")}
          aria-invalid={!!errors.time}
        />
        {errors.time && <p role="alert">{errors.time.message}</p>}
      </div>
      <div>
        <input
          type="text"
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          placeholder="Option description (optional)"
          {...register("description")}
          aria-invalid={!!errors.description}
        />
        {errors.description && <p role="alert">{errors.description.message}</p>}
      </div>
      <div>
        <input
          type="text"
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          placeholder="Question (optional)"
          {...register("question")}
          aria-invalid={!!errors.question}
        />
        {errors.question && <p role="alert">{errors.question.message}</p>}
      </div>
      <div>
        <textarea
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          {...register("endingText")}
          aria-invalid={!!errors.endingText}
        ></textarea>
        {errors.endingText && <p role="alert">{errors.endingText.message}</p>}
      </div>
      <button
        type="submit"
        className="inline-block rounded bg-blue-600 px-7 py-3 text-sm font-medium uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Uploading..." : "Submit"}
      </button>
    </form>
  );
};
