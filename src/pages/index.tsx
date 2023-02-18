import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import PageButtons from "../components/PageButtons";
import { signIn, signOut, useSession } from "next-auth/react";

const Home: React.FC = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [footerHeight, setFooterHeight] = useState("h-[4vh] ");

  useEffect(() => {
    console.log("change footer")
    if (isOpen) 
      setFooterHeight("h-[20vh] ")
    else 
      setFooterHeight("h-[4vh] ")
  }, [isOpen]);

  const bounce = () => {
    setFooterHeight("h-[6vh] ")
    setTimeout(() => {
      setFooterHeight("h-[4vh] ")
    }, 200);
  }

  const signInOut = (
    <>
      {session ? (
        <>
          <div className="flex flex-1 flex-col h-full w-full justify-center items-center font-semibold text-slate-800">
            <button onClick={() => void signOut()}>
              Log Out
            </button>
          </div>
        </>
      ) : (
        <>
          <div
            className="h-[4vh] w-full flex justify-center font-semibold text-slate-800"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Pick One" : "Log In"}
          </div>
          {isOpen &&
            <div className="flex flex-1 flex-col h-full w-full justify-center items-center">
              <div className="flex items-center justify-center w-[25vw] h-[20vw] rounded-full font-semibold bg-blue-400 text-slate-300 border-4 border-slate-300">
                <button onClick={() => void signIn()}>
                  Discord
                </button>
              </div>
            </div>
          }
        </>
      )}
    </>
  )

  return (
    <>
      <main className="w-screen h-screen bg-gradient-to-b from-[#1632a4] to-[#0c1b58]">
        <Header title={session ? "Landing" : ""} description="Stick It" />

        <div className="h-screen flex items-center">
          <div className="max-h-[80vh] w-full flex flex-row justify-center flex-wrap gap-2">
            {session ? (
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
            ) : (
              <>
                <div
                  className="w-[20vw] h-[20vw] rounded-lg bg-white"
                  onClick={() => {bounce()}}
                >
                  test Bounce
                </div>
              </>
            )}
          </div>
        </div>

        <Footer func={signInOut} size={footerHeight} />
      </main>
    </>
  );
};

export default Home;
