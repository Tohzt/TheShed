import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import PageButtons from "../components/PageButtons";
import { type GetServerSideProps } from "next";
import { type AppProps } from "next/app";
import { getProviders, useSession } from "next-auth/react";

const Home = ({ providers }: { providers: AppProps }) => {
  const { data: session } = useSession();

  return (
    <>
      <main className="w-screen h-screen bg-gradient-to-b from-[#1632a4] to-[#0c1b58]">
        <Header title={session ? "Landing" : ""} description="Stick It" />

        <div className="h-screen flex items-center">
          <div className="max-h-[80vh] w-full flex flex-row justify-center flex-wrap gap-2">
            {session ? (
              <>
                <PageButtons pagepath="/profile" label="PROFILE" style="" />
                <PageButtons pagepath="/arcade" label="ARCADE" style="" />
              </>
            ) : (
              <>
                <PageButtons pagepath="/arcade" label="ARCADE" style="" />
                <div
                  className="w-[20vw] h-[20vw] rounded-lg bg-white"
                >
                  test Bounce
                </div>
              </>
            )}
          </div>
        </div>

        <Footer providers={providers} open="Nevermind" closed={session ? "Log Out" : "Log In"} />
      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
