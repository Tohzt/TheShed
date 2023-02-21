import Head from "next/head";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import PageButtons from "../components/PageButtons"
import Header from "../components/header"
import Footer from "../components/Footer"
import { useStore } from "../../store/store"

const Home: React.FC = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: session } = useSession();
  const toggleDarkMode = useStore(state => state.toggle_dark_mode)
  const darkMode = useStore(state => state.dark_mode)

  return (
    <>
      <Head>
        <title>The Shed</title>
        <meta name="description" content="Burnt by Tohzt" />
        <link rel="icon" href="/tohzt.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <main className="fixed bg-gradient-to-b from-primary-light to-primary-dark">
        <Header />

        <div className="screen flex-col -center">
          <h1 className="bg-secondary">
            <span className="">Landing Page</span>
          </h1>
          <p className="text-2xl text-white">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>

          <div className="w-full pl-4 pr-4 overflow-y-auto flex-col gap-2">
            {session && (
              <>
              <button onClick={() => {toggleDarkMode(!darkMode)}}>
                hello
                </button>
                <PageButtons pagepath="/profile" label="PROFILE" style="bg-red-500" />
                <PageButtons pagepath="/arcade" label="ARCADE" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="CALENDAR" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="ALARM" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="BIDDING" style="bg-red-500" />
                {/*
                  <PageButtons pagepath="/profile" label="PROJECTS" style="bg-red-500" />
                <PageButtons pagepath="/profile" label="..." style="bg-red-500" />
                <PageButtons pagepath="/profile" label="..." style="bg-red-500" />
                <PageButtons pagepath="/profile" label="..." style="bg-red-500" />
                */}
              </>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default Home;
