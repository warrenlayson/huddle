import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";

const Login: NextPage = () => {
  const router = useRouter();

  const onSuccess = () => {
    const returnUrl = router.query.return_url as string;
    if (returnUrl) {
      router.push(returnUrl);
    }
  };

  return (
    <main className="flex h-screen flex-col items-center justify-center text-gray-800">
      <div className="max-w-4xl">
        <Head>
          <title>Login | Huddle</title>
          <meta name={"robots"} content={"noindex"} />
        </Head>
        <LoginForm onSuccess={onSuccess} />
      </div>
    </main>
  );
};

export default Login;
