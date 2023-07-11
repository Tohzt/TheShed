import React from 'react';
//import { useSession } from "next-auth/react";
import icon from '../../public/icon-192x192.png';

const ProfileIcon: React.FC = () => {
  //const { data: session } = useSession();
  return (
    <div className="sm:hidden flex -center border-4 border-black abs-tl w-[32vw] h-[32vw] ml-8 mt-8 overflow-hidden rounded-full">
      <img src={icon.src}></img>
    </div>
  );
};

export default ProfileIcon;

/*
      {session ? (
      <img src={session?.user?.image}></img>
      ) : (
      <img src={icon.src}></img>
      )}
  */
