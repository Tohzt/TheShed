import * as React from "react"
//import { useSession } from "next-auth/react";
import Header from "../../components/header"
import Footer from "../../components/Footer"

const SocialsPage = () => {
  //const { data: session } = useSession();

  return (true &&
    <>
      <Header />

      <div className="flex screen flex-col items-center justify-between bg-gradient-to-b from-primary-dark to-primary-light">
        <div className="header-margin"></div>
        <div
          className="
          flex flex-1
            overflow-hidden
            max-h-[60vh]
            w-[80vw]
            p-4 mt-[25vh]
            bg-secondary-dark 
            border-4 border-white 
            rounded-2xl 
            text-white text-center
          ">
          <div className="h-full w-full bg-secondary-light overflow-auto rounded-lg p-2">
            <h1>Socials</h1>
          </div>
        </div>
        <div className="footer-margin"></div>
      </div>

      <Footer goBack={true} signIn={false} signOut={false} />
    </>
  );
};

export default SocialsPage

