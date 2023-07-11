import React from 'react';
import { getProviders } from "next-auth/react"
//import { getProviders, signIn, signOut, useSession } from "next-auth/react"

const signInWithProvider = async () => {
  const providers = await getProviders();
  const current = Object.values(providers)[0];

}

const SignIn: React.FC = () => {
  //const { data: sessionData } = useSession();
  const handleSignInOut = () => {
    {/*
    if (!sessionData) {
      await signInWithProvider();
    }
    */}
  }

  return (
    <button
      className="w-[5em] h-[5em] bg-primary-light text-white rounded-2xl border-2 border-white"
      onClick={() => void handleSignInOut()}
    >
      Sign In
    </button>
  );
};

export default SignIn;

/*
  signIn(current.id)
    .then(() => )
    .catch((error) => {
      console.log(error);
    });
  */
