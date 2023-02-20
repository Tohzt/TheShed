import React from "react";
import Head from "next/head";
import Header from "../components/header";
import Footer from "../components/footer";
import PageButtons from "../components/PageButtons";
import { type GetServerSideProps } from "next";
import { type AppProps } from "next/app";
import { getProviders, useSession } from "next-auth/react";

const Home: React.FC = () => {
  const hello = api.example.hello.useQuery({ text: "from the tRPC" });
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>The Sled</title>
      </Head>
      
      <main className="flex flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="max-w-[500px] h-screen flex flex-col justify-start gap-12 pt-10">
          <div className="pl-4">
            <h1 className="text-5xl font-extrabold tracking-tight ">
              <span className="text-[hsl(280,100%,70%)]">Landing Page</span>
            </h1>
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
          </div>

          <div className="pt-2 bg-zinc-500 bg-opacity-40 flex flex-1 flex-row justify-center flex-wrap items-center gap-2">
            {session ? (
              <>
                <PageButtons pagepath="/profile" label="PROFILE" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="CALENDAR" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="ALARM" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="BIDDING" style="bg-red-500" />
                <PageButtons pagepath="/arcade" label="ARCADE" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="PROJECTS" style="bg-red-500" />
              </>
            ) : (
              <PageButtons pagepath="/arcade" label="ARCADE" style="bg-red-500" />
            )
            }
          </div>
        </div>

        <Footer providers={providers} open="Nevermind" closed={session ? "Log Out" : "Log In"} />
      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
