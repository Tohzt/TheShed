import React from 'react';
import { api } from "../utils/api";
import { useSession } from "next-auth/react";
//import Link from 'next/link';

const ProfileIcon: React.FC = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const placement = "h-[12vh] absolute top-0 w-screen items-center justify-center rounded-b-[42px] "
  const { data: session } = useSession();

  return (
    <>
      <div className={placement + "bg-zinc-900 bg-opacity-60 blur-sm translate-y-2"}></div>
      <div className={placement + "bg-zinc-500 text-white flex flex-col items-center pb-2 pt-2 gap-2"}>
        {session ? (
          <>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
              The <span className="text-[hsl(280,100%,70%)]">Profile</span>
            </h1>
            <p className="text-2xl">
              Basic Profile Shit
            </p>
          </>
        ) : (
          <>
            <h1 className="text-5xl font-extrabold tracking-tight ">
              <span className="text-[hsl(280,100%,70%)]">Landing Page</span>
            </h1>
            <p className="text-2xl text-white">
              {hello.data ? hello.data.greeting : "Loading tRPC query..."}
            </p>
          </>
        )}
      </div>
    </>
  );
};

export default ProfileIcon;
