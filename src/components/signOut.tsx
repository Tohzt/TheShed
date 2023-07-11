import React from 'react';
//import { signOut, useSession } from "next-auth/react"

const SignOut: React.FC = () => {
  //const { data: sessionData } = useSession();

  return (
    <button
      className="w-[5em] h-[5em] bg-primary-light text-white rounded-2xl border-2 border-white"
      onClick={() => {/* void signOut() */}}
    >
      Sign Out
    </button>
  );
};

export default SignOut;

