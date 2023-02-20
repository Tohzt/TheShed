import React from "react";
import { signOut } from "next-auth/react";

// @TODO: Try to get provider from here
const LogOut = () => {

  return (
    <>
      <div className="flex flex-1 flex-col h-full w-full justify-center items-center">
        <div className="flex items-center justify-center w-[25vw] h-[20vw] rounded-full font-semibold bg-slate-400 text-blue-300 border-4 border-slate-300">
          <button
            onClick={() => void signOut()}>
            Unlog yourself
          </button>
        </div>
      </div>
    </>
  )
}

export default LogOut;
