import React from 'react';
import { useSession } from "next-auth/react";
//import Link from 'next/link';

const ProfileIcon: React.FC = () => {
  const { data: session } = useSession();
  return (
    <div className="w-[60px] absolute top-0 right-0 m-4 overflow-hidden rounded-full">
      <img src={session?.user?.image}></img>
    </div>
  );
};

export default ProfileIcon;
