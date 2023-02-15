import Head from "next/head";
import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import SignInOut from "../components/signInOut"
import PageButtons from "../components/PageButtons"
import GoBack from "../components/goBack"

const Home: React.FC = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>The Shed</title>
        <meta name="description" content="Burnt by Tohzt" />
        <link rel="icon" href="/tohzt.ico" />
        <link rel="manifest" href="/manifest.json" />
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
            {session && (
              <>
                <PageButtons pagepath="/profile" label="PROFILE"/>
                <PageButtons pagepath="/profile" label="CALENDAR"/>
                <PageButtons pagepath="/profile" label="ALARM"/>
                <PageButtons pagepath="/profile" label="BIDDING"/>
                <PageButtons style="bg-red-500" pagepath="/arcade" label="ARCADE"/>
                <PageButtons pagepath="/profile" label="PROJECTS"/>
                <PageButtons pagepath="/profile" label="..."/>
                <PageButtons pagepath="/profile" label="..."/>
                <PageButtons pagepath="/profile" label="..."/>
              </>
            )}
          </div>

            <SignInOut />
        </div>
      </main>
    </>
  );
};

export default Home;
