import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";

import { auth } from "../lib/firebase";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

type FormSchema = z.infer<typeof formSchema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h1 className="text-2xl font-bold">Huddle Chat</h1>
      <div>
        <input
          type="text"
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          id="exampleFormControlInput2"
          placeholder="Email address"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="password"
          className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none"
          id="exampleFormControlInput2"
          placeholder="Password"
          {...register("password")}
          aria-invalid={!!errors.password}
        />
        {errors.password && <p role="alert">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        className="inline-block rounded bg-blue-600 px-7 py-3 text-sm font-medium uppercase leading-snug text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
