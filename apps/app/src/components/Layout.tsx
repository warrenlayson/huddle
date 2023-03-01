import React from "react";
import Head from "next/head";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type LayoutProps = { title: string; children?: React.ReactNode };

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className={"flex h-screen flex-col bg-black"}>
      <Head>
        <title>{title}</title>
      </Head>
      <Navbar />
      <main className={"flex flex-1 flex-col"}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
