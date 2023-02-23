import React from 'react';
import SignInOut from "./signInOut"

const Footer = () => {

  return (
    <div className="abs-br w-[25vw] h-[25vw] overflow-hidden flex -center bg-secondary-dark rounded-tl-2xl border-l-4 border-t-2 border-white">
      <SignInOut />
    </div>
  );
};
export default Footer;
