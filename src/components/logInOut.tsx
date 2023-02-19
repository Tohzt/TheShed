import React, { useState, useEffect } from "react";
import { type AppProps } from "next/app";
import { signIn, signOut, useSession } from "next-auth/react";

// @TODO: Try to get provider from here
const LogInOut = ({ providers }: { providers: AppProps }) => {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex flex-1 flex-col h-full w-full justify-center items-center">
        {session ? (
          <>
            <div className="flex items-center justify-center w-[25vw] h-[20vw] rounded-full font-semibold bg-slate-400 text-blue-300 border-4 border-slate-300">
              <button
                onClick={() =>
                  signOut()
                }
              >
                Unlog yourself
              </button>
            </div>
          </>
        ) : (
          <>
            {providers &&
              <div className="flex items-center justify-center w-[25vw] h-[20vw] rounded-full font-semibold bg-blue-400 text-slate-300 border-4 border-slate-300">
                {Object.values(providers).map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() =>
                      signIn(provider.id, {
                        callbackUrl: `${window.location.origin}`
                      })
                    }
                  >
                    {provider.name}
                  </button>
                ))}
              </div>
            }
          </>
        )}
      </div>
    </>
  )
}

export default LogInOut;

