import React from 'react';
import PageButtons from "./PageButtons"

interface pagesType {
  [key: string]: {
    pagePath: string,
    style: string,
    social: boolean
  }
}
const pages: pagesType = {
  "Tasks": {
    pagePath: "/tasks",
    style: "",
    social: false
  },
  "Socials": {
    pagePath: "/socials",
    style: "",
    social: true
  },
  "calendar": {
    pagePath: "/",
    style: "bg-primary",
    social: false
  },
  "arcade": {
    pagePath: "/arcade",
    style: "",
    social: false
  },
  "about": {
    pagePath: "/about",
    style: "",
    social: false
  },
}

const DisplayPages = () => {
  return (
    <>{
      Object.keys(pages).map((page, index) => {
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
    }</>
  )
}
export default DisplayPages;
