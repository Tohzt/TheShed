import Header from "../components/header";
import Footer from "../components/footer";
import PageButtons from "../components/PageButtons";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: React.FC = () => {
  const { data: session } = useSession();

  const signInOut = (
    <div className="flex items-center justify-center w-full h-full font-semibold text-slate-800">
      <button onClick={session ? () => void signOut() : () => void signIn()}>
        {session ? "sign out" : "sign in"}
      </button>
    </div>
  )

  return (
    <>
      <main className="w-screen h-screen bg-gradient-to-b from-[#1632a4] to-[#0c1b58]">
        <Header title={session ? "Landing" : ""} description="Stick It" />

        <div className="h-screen flex items-center">
          <div className="max-h-[80vh] w-full flex flex-row justify-center flex-wrap gap-2">
            {session && (
              <>
                <PageButtons pagepath="/profile" label="PROFILE" style="" />
                <PageButtons pagepath="/arcade" label="ARCADE" style="" />
                {/*
                <PageButtons pagepath="/profile" label="CALENDAR" style="" />
                <PageButtons pagepath="/profile" label="ALARM" style="" />
                <PageButtons pagepath="/profile" label="BIDDING" style="" />
                <PageButtons pagepath="/profile" label="PROJECTS" style="" />
                <PageButtons pagepath="/profile" label="..." style="" />
                <PageButtons pagepath="/profile" label="..." style="" />
                <PageButtons pagepath="/profile" label="..." style="" />
                */}
              </>
            )}
          </div>
        </div>

        <Footer func={signInOut} />
      </main>
    </>
  );
};

export default Home;
