import React, { useState, useEffect } from "react";
import { type GetServerSideProps } from "next";
import { type AppProps } from "next/app";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";

const SignIn = ({ providers }: { providers: AppProps }) => {
  return (
    <>
      <h1>Sign In</h1>
      <div>
        {Object.values(providers).map((provider) => (
          <button
            key={provider.id}
            onClick={() =>
              signIn(provider.id, {
                callbackUrl: `${window.location.origin}`
              })
            }
          >
            Sign In With Button
          </button>
        ))}
      </div>
    </>
  );
};

export default SignIn;

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
