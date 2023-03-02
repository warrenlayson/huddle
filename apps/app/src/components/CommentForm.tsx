import React from "react";
import Image from "next/image";
import { firestore } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";

const schema = z.object({
  comment: z.string().min(1).max(250, "Your comment should only be upto 250"),
});

type FormSchema = z.infer<typeof schema>;

function CommentForm() {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      comment: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      const commentsColRef = collection(firestore, "comments");
      await addDoc(commentsColRef, {
        comment: data.comment,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.log(e);
    }
    reset();
  };

  return (
    <form
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onSubmit={handleSubmit(onSubmit)}
      className={" my-6 flex flex-col space-y-4"}
    >
      <div className={"flex items-center space-x-4"}>
        <Image
          src={"/images/user_icon.svg"}
          alt={"User icon"}
          height={48}
          width={48}
        />
        <textarea
          rows={4}
          className={
            "dark:border--gray-600 block w-full rounded-lg border border-gray-300 bg-gray-500 p-2.5 text-sm text-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          }
          placeholder={"Join the discussion!"}
          {...register("comment")}
        ></textarea>
        {errors.comment && (
          <p className={"text-red-600"} role={"alert"}>
            {errors.comment.message}
          </p>
        )}
      </div>
      <button
        className={"w-fit self-end rounded-md bg-yellow-600 px-4 py-2"}
        type={"submit"}
        disabled={isSubmitting}
      >
        Comment
      </button>
    </form>
  );
}

export default CommentForm;
