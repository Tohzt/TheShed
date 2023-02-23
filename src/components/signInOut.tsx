import React from 'react';
import { getProviders, signIn, signOut, useSession } from "next-auth/react"

const signInWithProvider = async () => {
  const providers = await getProviders();
  const current = Object.values(providers)[0];
  
  signIn(current.id).then(() => {
    // Handle the success of the signIn operation, if needed
  }).catch((error) => {
    console.log(error);
    // Handle any errors that occur during the signIn operation
  });
}

const SignInOut: React.FC = () => {
  const { data: sessionData } = useSession();

  const handleSignInOut = async () => {
    if (sessionData) {
      await signOut();
    } else {
      await signInWithProvider();
    }
  }

  return (
    <button
      className="w-[20vw] h-[20vw] bg-primary-light text-white rounded-2xl border-2 border-white"
    onClick={() => void handleSignInOut()}
    >
      {sessionData ? "Sign Out" : "Sign In"}
    </button>
  );
};

export default SignInOut;

