import Head from "next/head";
import React from "react";
import PageButtons from "../components/PageButtons"
import Header from "../components/header"
//import Footer from "../components/Footer"
import SignInOut from "../components/signInOut"
//import { useStore } from "../../store/store"

// an object that holds multiple PageButtons componnents
interface pagesType {
  [key: string]: {
    pagePath: string,
    label: string,
    style: string
  }
}
const pages: pagesType = {
  "profile": { pagePath: "/profile", label: "PROFILE", style: "" },
  "alarm": { pagePath: "/", label: "ALARM", style: "bg-primary" },
  "calendar": { pagePath: "/", label: "CALENDAR", style: "bg-primary" },
  "arcade": { pagePath: "/arcade", label: "ARCADE", style: "" },
  "about": { pagePath: "/", label: "ABOUT", style: "bg-primary" },
}

const displayPages = () => {
  return Object.keys(pages).map((page, index) => {
    const style = pages[page]?.style + (index % 2 === 0 ? " offset-left" : " offset-right")
    return <PageButtons key={index} pagePath={pages[page]?.pagePath} label={pages[page]?.label} style={style} />
  })
}

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
          <div className="pt-[55vw] w-full overflow-y-auto flex-col gap-4">
            {displayPages()}
            {/*
              <button onClick={() => { toggleDarkMode(!darkMode) }}>
                hello
              </button>
            */}
          </div>
        </div>

        <div className="abs-br w-[25vw] h-[25vw] overflow-hidden flex -center bg-secondary-dark rounded-tl-2xl border-l-4 border-t-2 border-white">
          <SignInOut />
        </div>
      </main>
    </>
  );
};

export default Home;
