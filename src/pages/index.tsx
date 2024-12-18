import React from "react";
import Head from "next/head";
import Header from "../components/header"
import Footer from "../components/Footer"
import DisplayPages from "../components/DisplayPages"
//import SignInOut from "../components/signInOut"
//import { useStore } from "../../store/store"

const Home: React.FC = () => {
  //const toggleDarkMode = useStore(state => state.toggle_dark_mode)
  //const darkMode = useStore(state => state.dark_mode)

  return (
    <>
      <Head>
        <title>The Shed</title>
        <meta name="description" content="Burnt by Tohzt" />
        <link rel="icon" href="/tohzt.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <main className="fixed bg-gradient-to-t from-primary-light to-primary-dark">
        <Header />

        <div className="screen flex-col -center justify-start">
          <div className="pt-[55vw] sm:pt-[15vh] w-full overflow-y-auto flex-col gap-4">
            <DisplayPages />
            {/*
              <button onClick={() => { toggleDarkMode(!darkMode) }}>
                hello
              </button>
            */}
          </div>
        </div>

        <Footer goBack={false} signIn={true} signOut={true} />
      </main>
    </>
  );
};

export default Home;
