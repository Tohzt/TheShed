import React, { useState, useEffect } from "react";
import LogInOut from "./logInOut";
import GoBack from "./goBack";
import { type AppProps } from "next/app";

interface FooterProps {
  open?: string;
  closed?: string;
  providers?: AppProps;
}
const Footer: React.FC<FooterProps> = (props) => {

  const [isOpen, setIsOpen] = useState(false);
  const [footerHeight, setFooterHeight] = useState("h-[4vh] ");
  const placement = "absolute bottom-0 w-screen rounded-t-[42px] "

  useEffect(() => {
    if (isOpen) setFooterHeight("h-[20vh] ")
    else setFooterHeight("h-[4vh] ")
  }, [isOpen]);

  return (
    <div className={placement}>
      <div className={`${placement} h-[5vh] bg-zinc-900 bg-opacity-60 blur-sm`}></div>
      <div className={`${placement} ${footerHeight} transition-height duration-500 ease-in-out bg-gradient-to-tl from-[#ef8018] to-[#ffcb24] flex flex-col`}>
        <div
          className="h-[4vh] w-full flex justify-center font-semibold text-slate-800"
          onClick={() => setIsOpen(!isOpen)}
        > {isOpen ? props.open : props.closed} </div>

        {isOpen &&
          // @TODO: Consider passing components in and mapping through props
          <div className="w-full h-full">
            {props.providers ? (
              <>
                {props.open === "Nevermind" && <LogInOut providers={props.providers} />}
              </>
            ) : (
              <>
                {props.open === "Nevermind" && <LogInOut />}
              </>
            )}
            {props.open === "Games" && <GoBack />}
            {props.open === "Back" && <GoBack />}
          </div>
        }
      </div>
    </div>
  );
};
export default Footer
/* 
*/
