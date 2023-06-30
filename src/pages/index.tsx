import Head from "next/head";
import React from "react";
import PageButtons from "../components/PageButtons"
import Header from "../components/header"
import Footer from "../components/Footer"
//import SignInOut from "../components/signInOut"
//import { useStore } from "../../store/store"

interface pagesType {
  [key: string]: {
    pagePath: string,
    style: string,
    social: boolean
  }
}
const pages: pagesType = {
  "Personal": { 
    pagePath: "https://www.instagram.com/im_just.a.me", 
    style: "", 
    social: true },
  "Tattoo": { 
    pagePath: "https://www.instagram.com/tat.tohzt", 
    style: "", 
    social: true },
  "calendar": { 
    pagePath: "/", 
    style: "bg-primary", 
    social: false },
  "arcade": {
    pagePath: "/arcade", 
    style: "", 
    social: false },
  "about": { 
    pagePath: "/about", 
    style: "", 
    social: false },
}

const displayPages = () => {
  return Object.keys(pages).map((page, index) => {
    const style = pages[page]?.style + (index % 2 === 0 ? " offset-left" : " offset-right")
    return (
      <PageButtons
        key={index}
        pagePath={pages[page]?.pagePath}
        label={page}
        style={style} 
        //social={pages[page]!.social} 
        />
    )
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
        <div className="pt-[55vw] sm:pt-[15vh] w-full overflow-y-auto flex-col gap-4">
            {displayPages()}
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
