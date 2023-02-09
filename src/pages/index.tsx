import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "../utils/api";
import SignInOut from "./components/signInOut"
import PageButtoms from "./components/pageButtoms"

const Home: React.FC = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>The Shed</title>
        <meta name="description" content="Burnt by Tohzt" />
        <link rel="icon" href="/tohzt.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="w-screen h-screen flex flex-col items-center justify-start gap-12 pt-10">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              The <span className="text-[hsl(280,100%,70%)]">Shed</span>
            </h1>
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
          </div>

          <div className="pt-2 w-screen max-w-[600px] bg-zinc-500 bg-opacity-40 flex flex-1 flex-row justify-center flex-wrap items-center gap-2">
            {session && (
              <>
                <PageButtoms page="/profile" label="PROFILE"/>
                <PageButtoms page="/profile" label="CALENDAR"/>
                <PageButtoms page="/profile" label="ALARM"/>
                <PageButtoms page="/profile" label="BIDDING"/>
                <PageButtoms page="/profile" label="GAMES"/>
                <PageButtoms page="/profile" label="PROJECTS"/>
                <PageButtoms page="/profile" label="..."/>
                <PageButtoms page="/profile" label="..."/>
                <PageButtoms page="/profile" label="..."/>
              </>
            )}
          </div>

          <div className="pb-10">
            <SignInOut />
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
