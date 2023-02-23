import React from 'react';
import { signOut, useSession } from "next-auth/react"

const SignOut: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <button
      className="w-[20vw] h-[20vw] bg-primary-light text-white rounded-2xl border-2 border-white"
      onClick={() => void signOut()}
    >
      Sign Out
    </button>
  );
};

export default SignOut;

