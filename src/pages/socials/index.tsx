import * as React from "react"
import Header from "../../components/header"
import Footer from "../../components/Footer"
import SocialButtons from "../../components/SocialButtons"

interface socialType {
  [key: string]: {
    path: string,
    style: string
  }
}
const socials: socialType = {
  "Personal Instagram": {
    path: "https://www.instagram.com/im_just.a.me",
    style: ""
  },
  "Tattoo Instagram": {
    path: "https://www.instagram.com/tat.tohzt",
    style: "bg-primary"
  },
  "Personal YouTube": {
    path: "https://www.youtube.com/c/godsautobiography",
    style: ""
  },
  "LetsClone YouTube": {
    path: "https://www.youtube.com/c/letsclone",
    style: ""
  },
}

const displaySocials = () => {
  return Object.keys(socials).map((page, index) => {
    const style = socials[page]?.style
    return (
      <SocialButtons
        key={index}
        path={socials[page]?.path}
        label={page}
        style={style}
      />
    )
  })
}

const SocialsPage = () => {
  return (true &&
    <>
      <Header />

      <div className="flex screen flex-col items-center justify-between bg-gradient-to-b from-primary-dark to-primary-light">
        <div className="header-margin"></div>
        <div
          className="
            flex 
            overflow-hidden
            max-h-[60vh]
            w-[90vw]
            p-4 mt-[25vh]
            bg-secondary-dark 
            border-4 border-white 
            rounded-2xl 
            text-white text-center
          ">
          <div 
            className="
              bg-secondary-light 
              flex-col -center 
              gap-2
              h-full w-full 
              overflow-auto 
              rounded-lg p-2
              pb-8
            ">
            <h1 className="mb-8">Socials</h1>
            {displaySocials()}
          </div>
        </div>
        <div className="footer-margin"></div>
      </div>

      <Footer goBack={true} signIn={false} signOut={false} />
    </>
  );
};

export default SocialsPage

