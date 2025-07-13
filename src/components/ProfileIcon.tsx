import React from 'react'
import Image from 'next/image'
//import { useSession } from "next-auth/react";
import icon from '../../public/icon-192x192.png'

const ProfileIcon: React.FC = () => {
	//const { data: session } = useSession();
	return (
		<div className='-center abs-tl ml-8 mt-8 flex h-[32vw] w-[32vw] overflow-hidden rounded-full border-4 border-black sm:hidden'>
			<Image src={icon} alt='Profile icon' width={128} height={128} />
		</div>
	)
}

export default ProfileIcon

/*
      {session ? (
      <img src={session?.user?.image}></img>
      ) : (
			<Image src={icon} alt="Profile icon" width={128} height={128} />
      )}
  */
