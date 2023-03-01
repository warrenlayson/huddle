import React from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Login: NextPage = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);

  React.useEffect(() => {
    if (user) {
      void router.replace("/upload");
    }
  }, [router, user]);

  const onSuccess = async () => {
    const returnUrl = router.query.return_url as string;
    await router.push(returnUrl ?? "/upload");
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center text-gray-800">
      <div className="max-w-4xl">
        <Head>
          <title>Login | Huddle</title>
          <meta name={"robots"} content={"noindex"} />
        </Head>
        <LoginForm onSuccess={() => void onSuccess()} />
      </div>
    </main>
  );
};

export default Login;
