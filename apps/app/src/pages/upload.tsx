import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Upload: NextPage = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();

  React.useEffect(() => {
    if (!user) {
      router.replace("/login?return_url=/upload");
    }
  }, [user]);

  return (
    <Layout title={"Upload | Huddle"}>
      <Head>
        <meta name={"robots"} content={"noindex"} />
      </Head>
      <div>Upload page</div>
    </Layout>
  );
};

export default Upload;
