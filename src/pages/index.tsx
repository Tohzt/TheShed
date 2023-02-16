import Head from "next/head";
import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import Header from "../components/header";
import SignInOut from "../components/signInOut";
import PageButtons from "../components/PageButtons";

const Home: React.FC = () => {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>The Shed</title>
        <meta name="description" content="Burnt by Tohzt" />
        <link rel="icon" href="/tohzt.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <main className="w-screen h-screen bg-slate-600 ">
        <Header />

        <div className="h-screen flex items-center">
          <div className="max-h-[80vh] flex flex-row justify-center flex-wrap gap-2">
            {session && (
              <>
                <PageButtons pagepath="/profile" label="PROFILE" style="" />
                <PageButtons pagepath="/profile" label="CALENDAR" style="" />
                <PageButtons pagepath="/profile" label="ALARM" style="" />
                <PageButtons pagepath="/profile" label="BIDDING" style="" />
                <PageButtons pagepath="/arcade" label="ARCADE" style="" />
                <PageButtons pagepath="/profile" label="PROJECTS" style="" />
                <PageButtons pagepath="/profile" label="..." style="" />
                <PageButtons pagepath="/profile" label="..." style="" />
                <PageButtons pagepath="/profile" label="..." style="" />
              </>
            )}
          </div>
        </div>

        <SignInOut />
      </main>
    </>
  );
};

export default Home;
