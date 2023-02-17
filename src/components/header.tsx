import React from 'react';
import { api } from "../utils/api";
import { useSession } from "next-auth/react";
//import Link from 'next/link';

const Header: React.FC<{ title: string; description: string }> = (props) => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const placement = "h-[12vh] w-[90vw] absolute top-0 rounded-b-[42px] "
  const { data: session } = useSession();

  return (
    <>
      <div className="w-screen flex justify-center">
        <div className={placement + "w-[94vw] h-[14vh] bg-zinc-900 bg-opacity-60 blur-sm"}></div>
        <div className={placement + "w-[90vw] h-[12vh] bg-gradient-to-tl from-[#ef8018] to-[#ffcb24] text-white flex flex-col items-center pb-2 pt-2 gap-2"}>
          {session ? (
            <>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                <span className="text-zinc-800">{props.title}</span>
              </h1>
              <p className="text-2xl">
                {props.description}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-extrabold tracking-tight ">
                <span className="text-zinc-800">Landing Page</span>
              </h1>
              <p className="text-2xl text-white">
                {hello.data ? hello.data.greeting : "Loading tRPC query..."}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
