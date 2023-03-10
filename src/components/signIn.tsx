import React from 'react';
import { getProviders, signIn, signOut, useSession } from "next-auth/react"

const signInWithProvider = async () => {
  const providers = await getProviders();
  const current = Object.values(providers)[0];

  signIn(current.id)
    .then(() => {/**/ })
    .catch((error) => {
      console.log(error);
    });
}

const SignIn: React.FC = () => {
  const { data: sessionData } = useSession();
  const handleSignInOut = async () => {
    if (!sessionData) {
      await signInWithProvider();
    }
  }

  return (
    <button
      className="w-[20vw] h-[20vw] bg-primary-light text-white rounded-2xl border-2 border-white"
      onClick={() => void handleSignInOut()}
    >
      Sign In
    </button>
  );
};

export default SignIn;

