import React from 'react';
import SignIn from "./signIn"
import SignOut from "./signOut"
import GoBack from "./goBack";
import { useSession } from "next-auth/react"

interface FooterProps {
  goBack: boolean;
  signIn: boolean;
  signOut: boolean;
}

const Footer = (props: FooterProps) => {
  const { data: sessionData } = useSession();

  return (
    <div>
      {props.signIn && !sessionData &&
        <div className="abs-br w-[25vw] h-[25vw] overflow-hidden flex -center bg-secondary-dark rounded-tl-2xl border-l-4 border-t-2 border-white">
          <SignIn />
        </div>
      }
      {props.signOut && sessionData &&
        <div className="abs-br w-[25vw] h-[25vw] overflow-hidden flex -center bg-secondary-dark rounded-tl-2xl border-l-4 border-t-2 border-white">
          <SignOut />
        </div>
      }
      {props.goBack &&
        <div className="abs-bl w-[25vw] h-[25vw] overflow-hidden flex -center bg-secondary-dark rounded-tr-2xl border-r-4 border-t-2 border-white">
          <GoBack />
        </div>
      }
    </div>
  );
};
export default Footer;
