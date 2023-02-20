import * as React from "react"
import { useSession } from "next-auth/react";
import ProfileIcon from "../../components/ProfileIcon";
import GoBack from "../../components/goBack";

const ArcadePage = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <ProfileIcon />
      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="pt-10 text-white">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            The <span className="text-[hsl(280,100%,70%)]">Arcade</span>
          </h1>
          <p className="text-2xl">
            Basic Profile Shit
          </p>
        </div>

        <div className="flex flex-col flex-1 justify-around">
        <div className="bg-zinc-900 w-[90vw] h-[135vw] border-4 border-zinc-400 flex items-center justify-center">
          <iframe title='Mario Bros' src="../../../arcade/mario/index.html" width='100%' height='100%'></iframe>
        </div>
        </div>
      </div>
      <GoBack />
    </>
  );
};

export default ArcadePage

